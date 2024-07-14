/**
 * A URL on the site.
 * @gqlType
 */
export class SiteUrl {
  constructor(private _path: string) {}

  /**
   * Just the path portion of the URL. Excludes the protocol and domain
   *
   * Useful for links within the site.
   * @gqlField
   */
  path(): string {
    return this._path;
  }

  /**
   * The fully qualified URL.
   * @gqlField
   */
  fullyQualified(): string {
    return `https://jordaneldredge.com${this.path()}`;
  }
}
