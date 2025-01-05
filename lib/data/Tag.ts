import { Linkable } from "./interfaces";
import { SiteUrl } from "./SiteUrl";
import * as Data from "../data";
import { Content } from "../data";

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
  items(): Content[] {
    return Data.ContentConnection.withTag(this);
  }

  /** @gqlQueryField */
  static getTagByName(name: string): Tag {
    return new Tag(name);
  }
}
