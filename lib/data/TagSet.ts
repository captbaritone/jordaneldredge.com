import { Tag } from "./Tag";

/** @gqlType */
export class TagSet {
  constructor(private _tags: Tag[]) {}

  /** @gqlField */
  tags(): Tag[] {
    return this._tags;
  }

  tagNames(): string[] {
    return this._tags.map((tag) => tag.name());
  }

  static fromTagStrings(tagStrings: string[] | null): TagSet {
    if (tagStrings == null || tagStrings.length === 0) {
      return new TagSet([]);
    }
    return new TagSet(tagStrings.map((tag) => new Tag(tag)));
  }
}
