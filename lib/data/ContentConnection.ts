import { db, sql } from "../db";
import { compile } from "../services/search/Compiler";
import Content, { ContentDBRow } from "./Content";
import { PageType } from "./Indexable";
import { Tag } from "./Tag";

/** @gqlEnum */
type SortOption = "best" | "latest";

type ContentFilter = "showInLists" | "note" | "post";

export type ContentQuery = {
  sort: "best" | "latest";
  filters: ContentFilter[];
};

export default class ContentConnection {
  static all(query: ContentQuery): Content[] {
    return ContentConnection.search("", query.sort, null);
  }

  /**
   * Search for content by title, content, or tags.
   * @gqlQueryField
   */
  static search(
    query: string,
    sort: SortOption,
    first?: number | null,
  ): Array<Content> {
    const compiled = compile(query, sort, first ?? 20).value;
    const prepared = db.prepare<any, ContentDBRow>(compiled.query);
    return prepared.all(compiled.params).map((row) => new Content(row));
  }

  /**
   * Formal write-ups of projects and ideas.
   * @gqlQueryField
   */
  static blogPosts(): Array<Content> {
    return this.getAllByPageType("post");
  }

  /**
   * Quick thoughts, observations, and links.
   * @gqlQueryField
   */
  static notes(): Array<Content> {
    return this.getAllByPageType("note");
  }

  static withTag(tag: Tag): Array<Content> {
    return ContentConnection.search(`#${tag.name()}`, "best", null);
  }

  private static getAllByPageType(pageType: PageType): Content[] {
    return ContentConnection.search(`#${pageType}`, "best", null);
  }
}
