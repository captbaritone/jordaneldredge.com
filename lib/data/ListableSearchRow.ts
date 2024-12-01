import { SearchIndexRow } from "../search";
import { SiteUrl } from "./SiteUrl";
import { TagSet } from "./TagSet";
import { Markdown } from "./Markdown";
import { db, sql } from "../db";
import yaml from "js-yaml";

type Metadata = {
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

export default class ListableSearchRow {
  _item: SearchIndexRow;
  _metadata: Metadata;
  constructor(item: SearchIndexRow) {
    this._item = item;
    this._metadata = JSON.parse(item.metadata);
  }
  slug() {
    return this._item.slug;
  }
  title() {
    return this._item.title;
  }
  date(): string {
    return this._item.date;
  }
  summary() {
    return this._item.summary;
  }
  tagSet() {
    const tagStrings =
      this._item.tags.length < 1 ? [] : this._item.tags.split(" ");
    return TagSet.fromTagStrings(tagStrings);
  }
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
  content(): Promise<Markdown> | Markdown {
    return Markdown.fromString(this._item.content);
  }
  url() {
    switch (this._item.page_type) {
      case "page":
        return new SiteUrl(`/${this._item.slug}`);
      case "post":
        return new SiteUrl(`/blog/${this._item.slug}`);
      case "note":
        return new SiteUrl(`/notes/${this._item.slug}`);
    }
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

  static async allItems() {
    const rows = ALL_ITEMS_RANKED.all();
    return rows.map((row) => new ListableSearchRow(row));
  }

  static getNoteBySlug(slug: string): ListableSearchRow | null {
    return ListableSearchRow.getByTypeAndSlug("note", slug);
  }

  static getPostBySlug(slug: string): ListableSearchRow | null {
    return ListableSearchRow.getByTypeAndSlug("post", slug);
  }
  static getByTypeAndSlug(
    pageType: string,
    slug: string,
  ): ListableSearchRow | null {
    const row = CONTENT_BY_TYPE_AND_SLUG.get({ pageType, slug });
    if (row == null) {
      return null;
    }
    return new ListableSearchRow(row);
  }
}

const CONTENT_BY_TYPE_AND_SLUG = db.prepare<
  { pageType: string; slug: string },
  SearchIndexRow
>(sql`
  SELECT
    *
  FROM
    search_index
  WHERE
    page_type = :pageType
    AND slug = :slug
`);

const ALL_ITEMS_RANKED = db.prepare<[], SearchIndexRow>(sql`
  SELECT
    content,
    tags,
    feed_id,
    page_type,
    slug,
    summary,
    title,
    summary_image_path,
    metadata,
    DATE
  FROM
    search_index
  ORDER BY
    page_rank DESC
`);
