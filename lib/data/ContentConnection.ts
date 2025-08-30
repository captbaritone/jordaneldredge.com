import { Int } from "grats";
import { db } from "../db";
import { compile, ValidationError } from "search-query-dsl";
import Content, { ContentDBRow } from "./Content";
import { PageType } from "./Indexable";
import { Tag } from "./Tag";
import { SCHEMA } from "../services/search/CompilerConfig";
import { VC } from "../VC";

/** @gqlEnum */
type SortOption = "best" | "latest";

type ContentFilter = "showInLists" | "note" | "post";

export type ContentQuery = {
  sort: "best" | "latest";
  filters: ContentFilter[];
};

export default class ContentConnection {
  static all(vc: VC, query: ContentQuery): Content[] {
    return ContentConnection.search(vc, "", query.sort, null);
  }

  /**
   * Search for content by title, content, or tags.
   * @gqlQueryField
   */
  static search(
    vc: VC,
    query: string,
    sort: SortOption,
    first: Int | null,
  ): Array<Content> {
    return ContentConnection.searchResult(vc, query, sort, first).value;
  }

  static searchResult(
    vc: VC,
    query: string,
    sort: SortOption,
    first: Int | null,
  ): {
    value: Array<Content>;
    warnings: ValidationError[];
    sql: string;
    params: Record<string, unknown>;
  } {
    const compiledResult = compile(SCHEMA, query, sort, first);
    const prepared = db.prepare<any, ContentDBRow>(compiledResult.value.query);
    const value = prepared
      .all(compiledResult.value.params)
      .map((row) => Content.getByRow(vc, row))
      .filter((content) => content != null);
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
  static blogPosts(vc: VC): Array<Content> {
    return this.getAllByPageType(vc, "post");
  }

  /**
   * Quick thoughts, observations, and links.
   * @gqlQueryField
   */
  static notes(vc: VC): Array<Content> {
    return this.getAllByPageType(vc, "note");
  }

  static withTag(vc: VC, tag: Tag): Array<Content> {
    return ContentConnection.search(vc, `#${tag.name()}`, "best", null);
  }

  private static getAllByPageType(vc: VC, pageType: PageType): Content[] {
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
    return ContentConnection.search(vc, `is:${is}`, "latest", null);
  }
}
