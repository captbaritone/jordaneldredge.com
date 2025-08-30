import { SiteUrl } from "./SiteUrl";
import { TagSet } from "./TagSet";
import { Markdown } from "./Markdown";
import { db, sql, prepare } from "../db";
import yaml from "js-yaml";
import { PageType } from "./Indexable";
import TTSAudio from "./TTSAudio";
import { VC } from "../VC";

export type Metadata = {
  title?: string;
  summary_image?: string;
  summary?: string;
  tags?: string[];

  // Additional
  canonical_url?: string;
  github_comments_issue_id?: string;
  notion_id?: string;
  archive?: boolean;
  draft?: boolean;
};

export type ContentDBRow = {
  id: number;
  page_type: PageType;
  slug: string;
  title: string;
  summary: string;
  /** Space delimited list */
  tags: string;
  content: string;
  DATE: string;
  summary_image_path: string;
  feed_id: string;
  page_rank: number;
  last_updated: number;
  metadata: string;
};

/** @gqlType */
export default class Content {
  _item: ContentDBRow;
  _metadata: Metadata;
  private _vc: VC;

  /** @deprecated Prefer `Content.getByRow` */
  constructor(item: ContentDBRow, vc: VC) {
    this._item = item;
    this._metadata = JSON.parse(item.metadata);
    this._vc = vc;
  }

  static getByRow(vc: VC, row: ContentDBRow): Content | null {
    const content = new Content(row, vc);
    // Check if the content is draft or archived
    if (content.isDraft() && vc.canViewDraftContent()) {
      return null;
    }
    return content;
  }

  pageType(): PageType {
    return this._item.page_type;
  }
  id(): string {
    return String(this._item.id);
  }
  /** @gqlField */
  slug(): string {
    return this._item.slug;
  }
  /** @gqlField */
  title(): string {
    return this._item.title;
  }
  /**
   * YYYY-MM-DD in Local Time (PST)
   * @gqlField */
  date(): string {
    return this._item.DATE;
  }
  dateObj(): Date {
    const date = new Date(this._item.DATE);
    // Convert a date that was actually in local (PST) time to UTC
    // This is a workaround for the fact that SQLite stores dates without a timezone
    const localOffset = 8 * 60 * 60 * 1000;
    const utcDate = new Date(date.getTime() + localOffset);
    return utcDate;
  }
  /** @gqlField */
  summary(): string {
    return this._item.summary;
  }
  /** @gqlField */
  tagSet(): TagSet {
    const tagStrings =
      this._item.tags.length < 1 ? [] : this._item.tags.split(" ");
    return TagSet.fromTagStrings(tagStrings);
  }
  /** @gqlField */
  summaryImage(): string | undefined {
    return this._item.summary_image_path;
  }
  showInLists(): boolean {
    const archive = this._metadata.archive || false;
    const draft = this._metadata.draft || false;
    return !archive && !draft;
  }

  isDraft(): boolean {
    return !!this._metadata.draft;
  }

  isArchived(): boolean {
    return !!this._metadata.archive;
  }

  feedId(): string {
    return this._item.feed_id;
  }
  /** @gqlField */
  content(): Markdown {
    return Markdown.fromString(this._item.content, this._item.id);
  }
  /** @gqlField */
  url(): SiteUrl {
    return new SiteUrl(this._urlString());
  }

  /**
   * Url to download the post as a markdown file.
   * @gqlField */
  markdownUrl(): SiteUrl {
    return new SiteUrl(this._urlString() + ".md");
  }

  _urlString(): string {
    switch (this._item.page_type) {
      case "page":
        return `/${this._item.slug}`;
      case "post":
        return `/blog/${this._item.slug}`;
      case "note":
        return `/notes/${this._item.slug}`;
    }
  }

  // Admin-only URL for inspecting this piece of content
  debugUrl(): SiteUrl {
    return new SiteUrl(`/debug/content/${this.slug()}`);
  }

  /**
   * The audio version of this content, if it exists.
   * @gqlField */
  ttsAudio(): TTSAudio | null {
    return TTSAudio.fromContentId(this._vc, this.id());
  }

  serializedFilename(forceNotionId: boolean = false): string {
    const date = new Date(this.date()).toISOString().substring(0, 10);
    const slug = forceNotionId ? this._metadata.notion_id : this.slug();
    return `${date}-${slug}.md`;
  }

  metadata(): Metadata {
    return this._metadata;
  }

  githubCommentsIssueId(): string | undefined {
    return this._metadata.github_comments_issue_id;
  }

  contentWithHeader(): string {
    const data: Metadata = {
      title: this.title(),
      tags: this.tagSet().tagNames(),
    };
    if (this.summary()) {
      data.summary = this.summary();
    }
    for (const key in this._metadata) {
      data[key] = this._metadata[key];
    }
    if (this._item.summary_image_path) {
      data.summary_image = this._item.summary_image_path;
    }
    const yamlMetadata = yaml.dump(data);

    return `---\n${yamlMetadata}---\n${this._item.content}`;
  }

  canonicalUrl(): string | undefined {
    return this.metadata().canonical_url;
  }

  lastModified(): number {
    return this._item.last_updated;
  }

  related(first: number): Content[] {
    const ownTags = this.tagSet().tagNames();
    // For plural tags we can't use proper interpolation. So we filter out any
    // non-alphabetic tags as a security precaution.
    const validTags = ownTags.filter((tag) => {
      const isValid = tag.match(/^[a-zA-Z0-9]+$/);
      if (!isValid) {
        console.warn(`Invalid tag name: "${tag}"`);
      }
      return isValid;
    });
    const queryFragment =
      validTags.length > 0
        ? validTags.map((tag) => `(instr(tags, '${tag}') > 0)`).join(" + ")
        : "1"; // Fallback to 1 to ensure valid SQL

    const query = sql`
      SELECT
        id,
        page_type,
        slug,
        title,
        summary,
        tags,
        content,
        DATE,
        summary_image_path,
        metadata,
        feed_id,
        page_rank,
        (${queryFragment}) AS tag_match_count
      FROM
        content
      WHERE
        feed_id != :feedId
      ORDER BY
        tag_match_count DESC,
        page_rank DESC
      LIMIT
        :first;
    `;
    const rows = db
      .prepare<{ first: number; feedId: string }, ContentDBRow>(query)
      .all({ first, feedId: this.feedId() });

    return rows
      .map((item) => Content.getByRow(this._vc, item))
      .filter((content) => content != null);
  }

  static getNoteBySlug(vc: VC, slug: string): Content | null {
    return Content.getByTypeAndSlug(vc, "note", slug);
  }

  static getPostBySlug(vc: VC, slug: string): Content | null {
    return Content.getByTypeAndSlug(vc, "post", slug);
  }

  private static getByTypeAndSlug(
    vc: VC,
    pageType: string,
    slug: string,
  ): Content | null {
    const row = prepare<{ pageType: string; slug: string }, ContentDBRow>(sql`
      SELECT
        *
      FROM
        content
      WHERE
        page_type = :pageType
        AND (
          slug = :slug
          OR json_extract(metadata, '$.notion_id') = :slug
        );
    `).get({ pageType, slug });

    if (row == null) {
      return null;
    }
    return Content.getByRow(vc, row);
  }

  /**
   * Find a piece of content by its slug.
   * @gqlQueryField getContentBySlug */
  static getBySlug(vc: VC, slug: string): Content | null {
    const row = prepare<{ slug: string }, ContentDBRow>(sql`
      SELECT
        *
      FROM
        content
      WHERE
        slug = :slug
        OR json_extract(metadata, '$.notion_id') = :slug;
    `).get({ slug });

    if (row == null) {
      return null;
    }
    return Content.getByRow(vc, row);
  }

  static getById(vc: VC, id: number): Content | null {
    const row = prepare<{ id: number }, ContentDBRow>(sql`
      SELECT
        *
      FROM
        content
      WHERE
        id = :id
    `).get({ id });

    if (row == null) {
      return null;
    }
    return Content.getByRow(vc, row);
  }
}
