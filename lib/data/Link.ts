import { db, sql, prepare } from "../db";

/**
 * A link which has been embedded in a piece of content.
 * @gqlType */
export class Link {
  constructor(private _url: string) {}

  /** @gqlField */
  url(): string {
    if (this._url.startsWith("/")) {
      return `https://jordaneldredge.com${this._url}`;
    }
    return this._url;
  }

  /** @gqlQueryField */
  static links(): Array<Link> {
    const links = prepare<[], { link_url: string }>(sql`
      SELECT
        link_url
      FROM
        content_links
    `).all();
    return links.map((row) => new Link(row.link_url));
  }
}
