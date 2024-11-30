import { SearchIndexRow } from "../search";
import { Listable, Content } from "./interfaces";
import { SiteUrl } from "./SiteUrl";
import { TagSet } from "./TagSet";
import { Markdown } from "./Markdown";
import { getNoteBySlug } from "./Note";
import { db, sql } from "../db";

export default class ListableSearchRow implements Listable, Content {
  _item: SearchIndexRow;
  constructor(item: SearchIndexRow) {
    this._item = item;
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
    return TagSet.fromTagStrings(this._item.tags.split(" "));
  }
  async summaryImage(): Promise<string | undefined> {
    return this._item.summary_image_path;
  }
  showInLists() {
    return true;
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

  metadata(): Object {
    return JSON.parse(this._item.metadata);
  }

  static async allItems() {
    const rows = ALL_ITEMS_RANKED.all();
    return rows.map((row) => new ListableSearchRow(row));
  }

  static getNoteBySlug(slug: string) {
    return (
      ListableSearchRow.getByTypeAndSlug("note", slug) || getNoteBySlug(slug)
    );
  }

  static getPostBySlug(slug: string) {
    return ListableSearchRow.getByTypeAndSlug("post", slug);
  }

  static getByTypeAndSlug(pageType: string, slug: string) {
    const row = db
      .prepare<{ pageType: string; slug: string }, SearchIndexRow>(sql`
        SELECT
          *
        FROM
          search_index
        WHERE
          page_type = :pageType
          AND slug = :slug
      `)
      .get({ pageType, slug });
    if (row == null) {
      return null;
    }
    return new ListableSearchRow(row);
  }
}

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
