import { SearchIndexRow } from "../search";
import { Listable, Content } from "./interfaces";
import { SiteUrl } from "./SiteUrl";
import { TagSet } from "./TagSet";
import * as Search from "../search";
import { Markdown } from "./Markdown";

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

  static async allItems() {
    const db = await Search.getDb();
    const rows = await db.all(
      `
    SELECT
      content,
      tags,
      feed_id,
      page_type,
      slug,
      summary,
      title, 
      summary_image_path,
      date
    FROM search_index
    ORDER BY page_rank DESC`
    );
    return rows.map((row) => new ListableSearchRow(row));
  }

  static async getNoteBySlug(slug: string) {
    const db = await Search.getDb();
    const row = await db.get(
      "SELECT * FROM search_index WHERE page_type = 'note' AND slug = ?",
      slug
    );
    return new ListableSearchRow(row);
  }
}
