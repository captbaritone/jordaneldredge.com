import { Client, LogLevel } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { Markdown } from "./Markdown";
import { Indexable, Linkable, Listable } from "./interfaces.js";
import { Tag } from "./Tag";
import { SiteUrl } from "./SiteUrl";
import { Query } from "./GraphQLRoots";

type NoteMetadata = {
  slugToId: { [slug: string]: string };
  idToSlug: { [id: string]: string };
  idToTags: { [id: string]: string[] };
  idToSummary: { [id: string]: string };
  tagToIds: { [tag: string]: string[] };
};

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  logLevel: LogLevel.WARN,
});
const n2m = new NotionToMarkdown({ notionClient: notion });

/*
 Format this value by inserting hyphens (-)
in the following pattern: 8-4-4-4-12 (each number is the length of characters
between the hyphens).
Example: 1429989fe8ac4effbc8f57f56486db54 becomes 1429989f-e8ac-4eff-bc8f-57f56486db54.
This value is your page ID.
*/
const stringToId = (str: string): string => {
  const ID_REGEX = /([a-f\d]{8})([a-f\d]{4})([a-f\d]{4})([a-f\d]{4})([a-f\d]+)/;
  return str.replace(ID_REGEX, "$1-$2-$3-$4-$5");
};

const TIL_INDEX_PAGE_ID = "4817435c-8e47-4d3c-858f-6f5949339ffe";
const METADATA_DATABASE_ID = stringToId("bbac761ed5f849048b2045d928b5f453");

export async function _getMetadata(): Promise<NoteMetadata> {
  const result = await notion.databases.query({
    database_id: METADATA_DATABASE_ID,
  });

  // TODO: Pagination!

  const idToSummary = {};
  const slugToId = {};
  const idToSlug = {};

  const tagToIds = {};
  const idToTags = {};

  result.results.forEach((page) => {
    // @ts-ignore
    const properties = page.properties;
    const tags = properties.Tags.multi_select.map((select) => {
      return select.name;
    });

    const slug = properties.Slug.rich_text[0]?.text.content;
    const summary = properties.Summary.rich_text[0]?.text.content;
    const id = properties.Note.title[0]?.mention.page.id;
    if (slug && id) {
      slugToId[slug] = id;
      idToSlug[id] = slug;
    }
    for (const tag of tags) {
      if (!tagToIds[tag]) {
        tagToIds[tag] = [];
      }
      tagToIds[tag].push(id);
    }

    idToSummary[id] = summary;

    idToTags[id] = tags;
  });

  return { slugToId, idToSlug, idToTags, tagToIds, idToSummary };
}

async function getMetadata(): Promise<NoteMetadata> {
  try {
    return await _getMetadata();
  } catch (e) {
    console.error(e);
    return {
      slugToId: {},
      idToSlug: {},
      idToTags: {},
      tagToIds: {},
      idToSummary: {},
    };
  }
}

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
  tags(): Tag[] {
    if (this._tags != null) {
      return this._tags.map((tag) => new Tag(tag));
    }
    return [];
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
    const pageBlocks = await notion.blocks.children.list({ block_id: this.id });
    const mdblocks = await n2m.blocksToMarkdown(pageBlocks.results);
    return new Markdown(n2m.toMarkdownString(mdblocks));
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

export async function getAllNotes(): Promise<Note[]> {
  const [_children, metadata] = await Promise.all([
    notion.blocks.children.list({
      block_id: TIL_INDEX_PAGE_ID,
    }),
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
  const { slugToId, idToSlug, idToTags, idToSummary } = await getMetadata();

  const id = slugToId[slug] ?? slug;
  const summary = idToSummary[id];

  const tags = idToTags[id];
  const pagePromise = notion.pages.retrieve({
    page_id: id,
  });
  const page: any = await notion.blocks.children.list({ block_id: id });

  if (
    page.parent.type !== "page_id" ||
    page.parent.page_id !== TIL_INDEX_PAGE_ID
  ) {
    throw new Error("Invalid page ID.");
  }

  const title = page.properties.title.title[0].text.content;
  return new Note(id, slug, tags, title, summary, page.created_time);
}
