import { Linkable, Listable } from "./interfaces.js";
import { getAllNotes } from "./Note";
import { getAllPosts } from "./Post";

export class Tag implements Linkable {
  constructor(private _name: string) {}

  name(): string {
    return this._name;
  }
  url(): string {
    return `/tag/${this.name()}`;
  }

  /**
   * The list of items that have this tag.
   */
  async items(): Promise<Listable[]> {
    const allPosts = getAllPosts();
    const allNotes = await getAllNotes();

    const publicPosts = allPosts.filter(
      (post) =>
        post.showInLists() &&
        post.tags().some((tag) => tag.name() === this._name)
    );

    const publicNotes = allNotes.filter((note) =>
      note.tags().some((tag) => tag.name() === this._name)
    );

    return [...publicPosts, ...publicNotes];
  }
}
