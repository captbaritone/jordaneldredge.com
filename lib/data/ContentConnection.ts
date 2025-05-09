import { Int } from "grats";
import { db, sql } from "../db";
import { compile } from "../services/search/Compiler";
import Content, { ContentDBRow } from "./Content";
import { PageType } from "./Indexable";
import { Tag } from "./Tag";
import { Result, ValidationError } from "../services/search/Diagnostics";

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
    first?: Int | null,
  ): Array<Content> {
    return ContentConnection.searchResult(query, sort, first).value;
  }

  static searchResult(
    query: string,
    sort: SortOption,
    first?: Int | null,
  ): {
    value: Array<Content>;
    warnings: ValidationError[];
    sql: string;
    params: Record<string, unknown>;
  } {
    const compiledResult = compile(
      query,
      sort,
      first === undefined ? 20 : first,
    );
    const prepared = db.prepare<any, ContentDBRow>(compiledResult.value.query);
    const value = prepared
      .all(compiledResult.value.params)
      .map((row) => new Content(row));
    return {
      value,
      sql: compiledResult.value.query,
      params: compiledResult.value.params,
      warnings: compiledResult.warnings,
    };
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
    let is: string;
    switch (pageType) {
      case "post":
        is = "blog";
        break;
      case "note":
        is = "note";
        break;
      default:
        throw new Error(`Unknown page type: ${pageType}`);
    }
    return ContentConnection.search(`is:${is}`, "latest", null);
  }
}
