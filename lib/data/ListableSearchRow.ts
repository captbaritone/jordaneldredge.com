import { SearchIndexRow } from "../search";
import { Listable } from "./interfaces";
import { SiteUrl } from "./SiteUrl";
import { TagSet } from "./TagSet";

export default class ListableSearchRow implements Listable {
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
}
