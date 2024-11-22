import { getDb } from "../search";
import { Query } from "./GraphQLRoots";
import { Linkable, Listable } from "./interfaces";
import { SiteUrl } from "./SiteUrl";
import * as Data from "../data";

/**
 * A tag that can be associated with items.
 * @gqlType
 */
export class Tag implements Linkable {
  constructor(private _name: string) {}

  /** @gqlField */
  name(): string {
    return this._name;
  }
  /** @gqlField */
  url(): SiteUrl {
    return new SiteUrl(`/tag/${this.name()}`);
  }

  /**
   * The list of items that have this tag.
   * @gqlField
   */
  async items(): Promise<Listable[]> {
    const db = await getDb();
    const rows = await db.all(
      `
  SELECT
    search_index.slug,
    search_index.page_type,
    search_index.summary,
    search_index.tags,
    search_index.title,
    search_index.summary_image_path,
    search_index.date,
    search_index.feed_id
  FROM search_index
  WHERE search_index.tags LIKE '%' || ? || '%'
  ORDER BY page_rank DESC;`,
      [this.name()]
    );
    return rows.map((row) => new Data.ListableSearchRow(row));
  }

  /** @gqlField */
  static getTagByName(_: Query, args: { name: string }): Tag {
    return new Tag(args.name);
  }
}
