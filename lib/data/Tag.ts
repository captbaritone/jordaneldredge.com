import { Query } from "./GraphQLRoots";
import { Linkable, Listable } from "./interfaces";
import { getAllNotes } from "./Note";
import { getAllPosts } from "./Post";
import { SiteUrl } from "./SiteUrl";

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
    const allPosts = getAllPosts();
    const allNotes = await getAllNotes();

    const publicPosts = allPosts.filter((post) => {
      const tagNames = post.tagSet().tagNames();
      return tagNames.some((tag) => tag === this._name);
    });

    const publicNotes = allNotes.filter((note) => {
      const tagNames = note.tagSet().tagNames();
      return tagNames.some((tag) => tag === this._name);
    });

    return [...publicPosts, ...publicNotes];
  }

  /** @gqlField */
  static getTagByName(_: Query, args: { name: string }): Tag {
    return new Tag(args.name);
  }
}
