import { Markdown } from "./Markdown";
import { Indexable, Linkable, Listable } from "./interfaces.js";
import { Tag } from "./Tag";
import { SiteUrl } from "./SiteUrl";
import { Query } from "./GraphQLRoots";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import {
  blocksToMarkdownString,
  getMetadata,
  retrieveBlocks,
  retrievePage,
} from "../services/notion";
import { dump } from "js-yaml";
import { TagSet } from "./TagSet";

/**
 * A less formal post. Usually a quite observation, shared link or anecdote.
 * @gqlType
 */
export class Note implements Indexable, Linkable, Listable {
  pageType = "note" as const;
  constructor(
    private id: string,
    private _slug: string,
    private _tags: string[],
    private _title: string,
    private _summary: string | undefined,
    private _date: string
  ) {}

  /** @gqlField */
  url(): SiteUrl {
    return new SiteUrl(`/notes/${this.slug()}`);
  }

  /** @gqlField */
  tagSet(): TagSet {
    return TagSet.fromTagStrings(this._tags);
  }

  /** A unique name for the Note. Used in the URL and for refetching. */
  slug(): string {
    return this._slug;
  }

  /** @gqlField */
  title(): string {
    return this._title;
  }

  /** @gqlField */
  date(): string {
    return this._date;
  }

  /** @gqlField */
  summary(): string | undefined {
    return this._summary;
  }

  /** @gqlField */
  async content(): Promise<Markdown> {
    const pageBlocks = await retrieveBlocks(this.id);
    const markdown = await blocksToMarkdownString(pageBlocks.results);
    return new Markdown(markdown);
  }

  /**
   * Return as a Markdown file including a yaml header with metadata including
   * tags and summary.
   *
   * See .serializedFilename() for the filename.
   */
  async serialize(): Promise<Markdown> {
    const content = await this.content();
    const metadata = dump({
      title: this.title(),
      tags: this.tagSet()
        .tags()
        .map((tag) => tag.name()),
      summary: this.summary(),
    }).trim();
    const markdownContent = content.markdownString().trim();

    const markdown = `---\n${metadata}\n---\n${markdownContent}\n`;

    return new Markdown(markdown);
  }

  async serializedFilename(): Promise<string> {
    const date = new Date(this.date()).toISOString().substring(0, 10);
    return `${date}-${this.slug()}.md`;
  }

  /** @gqlField */
  static async getNoteBySlug(_: Query, args: { slug: string }): Promise<Note> {
    return getNoteBySlug(args.slug);
  }

  /** @gqlField  */
  static async getAllNotes(_: Query): Promise<Note[]> {
    return getAllNotes();
  }
}

const TIL_INDEX_PAGE_ID = "4817435c-8e47-4d3c-858f-6f5949339ffe";

export async function getAllNotes(): Promise<Note[]> {
  const [_children, metadata] = await Promise.all([
    retrieveBlocks(TIL_INDEX_PAGE_ID),
    getMetadata(),
  ]);

  const children = _children as any;

  return children.results
    .filter((block) => block.type === "child_page")
    .sort((a, b) => {
      return a.created_time > b.created_time ? -1 : 1;
    })
    .map((page) => {
      const slug = metadata.idToSlug[page.id] || page.id;
      const tags = metadata.idToTags[page.id] || [];
      const summary = metadata.idToSummary[page.id];
      return new Note(
        page.id,
        slug,
        tags,
        page.child_page.title,
        summary,
        // TODO: This might be the metadata's created time
        page.created_time
      );
    });
}

export async function getNoteBySlug(slug: string): Promise<Note> {
  const { slugToId, idToTags, idToSummary } = await getMetadata();

  const id = slugToId[slug] ?? slug;
  const page = await retrievePage(id);
  if (
    page.parent.type !== "page_id" ||
    page.parent.page_id !== TIL_INDEX_PAGE_ID
  ) {
    throw new Error("Invalid page ID.");
  }

  const title = expectTitle(page, slug);

  const summary = idToSummary[id];
  const tags = idToTags[id];
  return new Note(id, slug, tags, title, summary, page.created_time);
}

function expectTitle(page: PageObjectResponse, slug: string): string {
  const titleObj = page.properties.title;
  if (titleObj.type !== "title") {
    throw new Error(`Invalid title object for ${slug}.`);
  }

  const texts = titleObj.title.map((block) => {
    if (block.type !== "text") {
      throw new Error(`Expected a text block for ${slug}.`);
    }
    return block.text.content;
  });

  return texts.join(" ");
}
