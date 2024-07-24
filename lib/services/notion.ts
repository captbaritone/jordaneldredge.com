import { Client, LogLevel } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import {
  ListBlockChildrenResponse,
  PageObjectResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { ListBlockChildrenResponseResults } from "notion-to-md/build/types";
import type { Node } from "unist";
import { parse } from "../data/markdownUtils";
import { memoize, TEN_MINUTES } from "../memoize";

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

export async function blocksToMarkdownAst(
  blocks: ListBlockChildrenResponseResults
): Promise<Node> {
  const mdBlocks = await n2m.blocksToMarkdown(blocks);
  // In the future we could define a direct mapping from the n2m AST to unist
  // AST without having to serialize in the middle.
  const markdownString = n2m.toMarkdownString(mdBlocks);
  return parse(markdownString);
}

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

export const getMetadata = memoize(
  { ttl: TEN_MINUTES, key: "getMetadata" },
  async (): Promise<NoteMetadata> => {
    const result = await retrieveDatabase(METADATA_DATABASE_ID);

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
);

export const retrievePage = memoize(
  { ttl: TEN_MINUTES, key: "retrievePage" },
  async (id: string): Promise<PageObjectResponse> => {
    // @ts-ignore Not sure how to convince TypeScript that we are not getting a partial response.
    const page: PageObjectResponse = await notion.pages.retrieve({
      page_id: id,
    });
    if (
      page.parent.type !== "page_id" ||
      // NOTE! This is belt and suspenders security boundary. The integration
      // itself should only have permission to see the relevant pages.
      page.parent.page_id !== TIL_INDEX_PAGE_ID
    ) {
      throw new Error("Invalid page ID.");
    }
    return page;
  }
);

export const retrieveBlocks = memoize(
  { ttl: TEN_MINUTES, key: "retrieveBlocks" },
  (id: string): Promise<ListBlockChildrenResponse> => {
    return notion.blocks.children.list({ block_id: id });
  }
);

export const retrieveDatabase = memoize(
  { ttl: TEN_MINUTES, key: "retrieveDatabase" },
  (id: string): Promise<QueryDatabaseResponse> => {
    return notion.databases.query({ database_id: id });
  }
);
