import { db, sql } from "../db";
import Content, { ContentDBRow } from "./Content";
import { PageType } from "./Indexable";
import { Tag } from "./Tag";

type ContentFilter = "showInLists" | "note" | "post";

export type ContentQuery = {
  sort: "best" | "latest";
  filters: ContentFilter[];
};

export default class ContentConnection {
  static all(query: ContentQuery): Content[] {
    let rows: ContentDBRow[];
    switch (query.sort) {
      case "best":
        rows = ALL_ITEMS_RANKED.all();
        break;
      case "latest":
        rows = ALL_ITEMS_LATEST.all();
        break;
      default:
        throw new Error(`Unknown sort: ${query.sort}`);
    }
    let content = rows.map((row) => new Content(row));
    for (const filter of query.filters) {
      switch (filter) {
        case "showInLists":
          content = content.filter((item) => item.showInLists());
          break;
        default:
          throw new Error(`Unknown filter: ${filter}`);
      }
    }
    return content;
  }

  /**
   * Search for content by title, content, or tags.
   * @gqlQueryField
   */
  static search(query: string, sort: "best" | "latest"): Array<Content> {
    const rows = SEARCH.all({ query, sortBy: sort, limit: 20 });
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
    const rows = ITEMS_WITH_TAG.all({ tag: tag.name() });
    return rows.map((row) => new Content(row));
  }

  private static getAllByPageType(pageType: PageType): Content[] {
    const rows = GET_ALL_BY_PAGE_TYPE.all({ pageType });
    return rows.map((row) => new Content(row));
  }
}

const ALL_ITEMS_RANKED = db.prepare<[], ContentDBRow>(sql`
  SELECT
    *
  FROM
    content
  ORDER BY
    page_rank DESC
`);

const ALL_ITEMS_LATEST = db.prepare<[], ContentDBRow>(sql`
  SELECT
    *
  FROM
    content
  ORDER BY
    DATE DESC,
    title;
`);

const SEARCH = db.prepare<
  { query: string; limit: number; sortBy: "best" | "latest" },
  ContentDBRow
>(sql`
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
    CASE :sortBy
      WHEN 'best' THEN RANK
      ELSE NULL
    END DESC,
    CASE :sortBy
      WHEN 'latest' THEN content.DATE
      ELSE NULL
    END DESC
  LIMIT
    :limit;
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
