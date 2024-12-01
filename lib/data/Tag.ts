import { Query } from "./GraphQLRoots";
import { Linkable } from "./interfaces";
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
  items(): Data.Content[] {
    return Data.Content.withTag(this);
  }

  /** @gqlField */
  static getTagByName(_: Query, args: { name: string }): Tag {
    return new Tag(args.name);
  }
}
