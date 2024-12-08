import { SiteUrl } from "./SiteUrl";
import { TagSet } from "./TagSet";
import { Markdown } from "./Markdown";
import { db, sql } from "../db";
import yaml from "js-yaml";
import { PageType } from "./Indexable";
import { Tag } from "./Tag";
import TTSAudio from "./TTSAudio";

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

type ContentDBRow = {
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
  constructor(item: ContentDBRow) {
    this._item = item;
    this._metadata = JSON.parse(item.metadata);
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
  /** @gqlField */
  date(): string {
    return this._item.DATE;
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
  async summaryImage(): Promise<string | undefined> {
    return this._item.summary_image_path;
  }
  showInLists(): boolean {
    const archive = this._metadata.archive || false;
    const draft = this._metadata.draft || false;
    return !archive && !draft;
  }
  feedId(): string {
    return this._item.feed_id;
  }
  /** @gqlField */
  content(): Markdown {
    return Markdown.fromString(this._item.content);
  }
  /** @gqlField */
  url(): SiteUrl {
    switch (this._item.page_type) {
      case "page":
        return new SiteUrl(`/${this._item.slug}`);
      case "post":
        return new SiteUrl(`/blog/${this._item.slug}`);
      case "note":
        return new SiteUrl(`/notes/${this._item.slug}`);
    }
  }
  ttsAudio(): TTSAudio | null {
    return TTSAudio.fromContentId(this.id());
  }

  publicAudioUrl(): SiteUrl | null {
    if (this.ttsAudio() == null) {
      return null;
    }
    return new SiteUrl(this.url().path() + ".mp3");
  }

  serializedFilename(forceNotionId: boolean = false): string {
    const date = new Date(this.date()).toISOString().substring(0, 10);
    const slug = forceNotionId ? this._metadata.notion_id : this.slug();
    return `${date}-${slug}.md`;
  }

  metadata(): Metadata {
    return this._metadata;
  }

  /** @gqlField */
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
    return rows.map((item) => new Content(item));
  }

  static all() {
    const rows = ALL_ITEMS_RANKED.all();
    return rows.map((row) => new Content(row));
  }

  static search(query: string): Array<Content> {
    const rows = SEARCH.all({ query });
    function getItem(m: ContentDBRow): Content | null {
      switch (m.page_type) {
        case "post":
        case "note":
          const item = new Content(m);
          if (!item.showInLists()) {
            return null;
          }
          return item;
        default:
          return null;
      }
    }
    return rows.map((row) => getItem(row)).filter((item) => item != null);
  }

  static blogPosts(): Array<Content> {
    return this.getAllByPageType("post");
  }

  static notes(): Array<Content> {
    return this.getAllByPageType("note");
  }

  static withTag(tag: Tag): Array<Content> {
    const rows = ITEMS_WITH_TAG.all({ tag: tag.name() });
    return rows.map((row) => new Content(row));
  }

  static getNoteBySlug(slug: string): Content | null {
    return Content.getByTypeAndSlug("note", slug);
  }

  static getPostBySlug(slug: string): Content | null {
    return Content.getByTypeAndSlug("post", slug);
  }

  private static getByTypeAndSlug(
    pageType: string,
    slug: string,
  ): Content | null {
    const row = CONTENT_BY_TYPE_AND_SLUG.get({ pageType, slug });
    if (row == null) {
      return null;
    }
    return new Content(row);
  }

  static getBySlug(slug: string): Content | null {
    const row = CONTENT_BY_SLUG.get({ slug });
    if (row == null) {
      return null;
    }
    return new Content(row);
  }
  private static getAllByPageType(pageType: PageType): Content[] {
    const rows = GET_ALL_BY_PAGE_TYPE.all({ pageType });
    return rows.map((row) => new Content(row));
  }
}

const GET_ALL_BY_PAGE_TYPE = db.prepare<{ pageType: PageType }, ContentDBRow>(
  sql`
    SELECT
      *
    FROM
      content
    WHERE
      page_type = :pageType
    ORDER BY
      DATE DESC;
  `,
);

const CONTENT_BY_TYPE_AND_SLUG = db.prepare<
  { pageType: string; slug: string },
  ContentDBRow
>(sql`
  SELECT
    *
  FROM
    content
  WHERE
    page_type = :pageType
    AND slug = :slug
`);

const CONTENT_BY_SLUG = db.prepare<{ slug: string }, ContentDBRow>(sql`
  SELECT
    *
  FROM
    content
  WHERE
    slug = :slug
`);

const ALL_ITEMS_RANKED = db.prepare<[], ContentDBRow>(sql`
  SELECT
    *
  FROM
    content
  ORDER BY
    page_rank DESC
`);

const SEARCH = db.prepare<{ query: string }, ContentDBRow>(sql`
  SELECT
    content.*
  FROM
    content_fts
    LEFT JOIN content ON content.rowid = content_fts.rowid
  WHERE
    content_fts MATCH (
      'title:' || :query || '*' || ' OR content:' || :query || '*' || ' OR tags:' || :query || '*' || ' OR summary:' || :query || '*'
    )
  ORDER BY
    RANK
  LIMIT
    20;
`);

const ITEMS_WITH_TAG = db.prepare<{ tag: string }, ContentDBRow>(sql`
  SELECT
    *
  FROM
    content
  WHERE
    tags LIKE '%' || :tag || '%'
  ORDER BY
    page_rank DESC;
`);
