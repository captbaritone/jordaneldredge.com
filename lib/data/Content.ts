import { SiteUrl } from "./SiteUrl";
import { TagSet } from "./TagSet";
import { Markdown } from "./Markdown";
import { db, sql } from "../db";
import yaml from "js-yaml";
import { PageType } from "./Indexable";
import { Tag } from "./Tag";

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

export default class Content {
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
        search_index
      WHERE
        feed_id != :feedId
      ORDER BY
        tag_match_count DESC,
        page_rank DESC
      LIMIT
        :first;
    `;
    const rows = db
      .prepare<{ first: number; feedId: string }, SearchIndexRow>(query)
      .all({ first, feedId: this.feedId() });
    return rows.map((item) => new Content(item));
  }

  static async all() {
    const rows = ALL_ITEMS_RANKED.all();
    return rows.map((row) => new Content(row));
  }

  static search(query: string): Array<Content> {
    const rows = SEARCH.all({ query });
    function getItem(m: SearchIndexRow): Content | null {
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
    const rows = GET_ALL_BLOG_POSTS.all();
    return rows.map((row) => new Content(row));
  }

  static notes(): Array<Content> {
    const rows = GET_ALL_NOTES.all();
    return rows.map((row) => new Content(row));
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
}

const GET_ALL_BLOG_POSTS = db.prepare<[], SearchIndexRow>(sql`
  SELECT
    search_index.slug,
    search_index.page_type,
    search_index.summary,
    search_index.tags,
    search_index.title,
    search_index.summary_image_path,
    search_index.metadata,
    search_index.date,
    search_index.feed_id
  FROM
    search_index
  WHERE
    search_index.page_type = 'post'
  ORDER BY
    DATE DESC;
`);
const GET_ALL_NOTES = db.prepare<[], SearchIndexRow>(sql`
  SELECT
    search_index.slug,
    search_index.page_type,
    search_index.summary,
    search_index.tags,
    search_index.title,
    search_index.summary_image_path,
    search_index.metadata,
    search_index.date,
    search_index.feed_id,
    search_index.last_updated,
    search_index.content
  FROM
    search_index
  WHERE
    search_index.page_type = 'note'
  ORDER BY
    DATE DESC;
`);

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

type SearchIndexRow = {
  page_type: PageType;
  slug: string;
  title: string;
  summary: string;
  /** Space delimited list */
  tags: string;
  content: string;
  date: string;
  summary_image_path: string;
  feed_id: string;
  page_rank: number;
  last_updated: number;
  metadata: string;
};

const SEARCH = db.prepare<{ query: string }, SearchIndexRow>(sql`
  SELECT
    search_index.slug,
    search_index.page_type,
    search_index.summary,
    search_index.tags,
    search_index.title,
    search_index.summary_image_path,
    search_index.date,
    search_index.metadata,
    search_index.feed_id
  FROM
    search_index_fts
    LEFT JOIN search_index ON search_index.rowid = search_index_fts.rowid
  WHERE
    search_index_fts MATCH (
      'title:' || :query || '*' || ' OR content:' || :query || '*' || ' OR tags:' || :query || '*' || ' OR summary:' || :query || '*'
    )
  ORDER BY
    RANK
  LIMIT
    20;
`);

const ITEMS_WITH_TAG = db.prepare<{ tag: string }, SearchIndexRow>(sql`
  SELECT
    search_index.slug,
    search_index.page_type,
    search_index.summary,
    search_index.tags,
    search_index.title,
    search_index.summary_image_path,
    search_index.metadata,
    search_index.date,
    search_index.feed_id
  FROM
    search_index
  WHERE
    search_index.tags LIKE '%' || :tag || '%'
  ORDER BY
    page_rank DESC;
`);
