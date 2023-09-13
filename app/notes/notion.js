import { Client, LogLevel } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

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
const stringToId = (str) => {
  const ID_REGEX = /([a-f\d]{8})([a-f\d]{4})([a-f\d]{4})([a-f\d]{4})([a-f\d]+)/;
  return str.replace(ID_REGEX, "$1-$2-$3-$4-$5");
};

const TIL_INDEX_PAGE_ID = "4817435c-8e47-4d3c-858f-6f5949339ffe";
const METADATA_DATABASE_ID = stringToId("bbac761ed5f849048b2045d928b5f453");

export const _getMetadata = async () => {
  const result = await notion.databases.query({
    database_id: METADATA_DATABASE_ID,
  });

  // TODO: Pagination!

  const slugToId = {};
  const idToSlug = {};

  result.results.forEach((page) => {
    const slug = page.properties.Slug.rich_text[0]?.text.content;
    const id = page.properties.Note.title[0]?.mention.page.id;
    if (slug && id) {
      slugToId[slug] = id;
      idToSlug[id] = slug;
    }
  });

  return { slugToId, idToSlug };
};

export const getMetadata = async () => {
  try {
    return await _getMetadata();
  } catch (e) {
    console.error(e);
    return { slugToId: {}, idToSlug: {} };
  }
};

export const getNotes = async () => {
  const children = await notion.blocks.children.list({
    block_id: TIL_INDEX_PAGE_ID,
  });

  const childPages = children.results
    .filter((block) => block.type === "child_page")
    .sort((a, b) => {
      return a.created_time > b.created_time ? -1 : 1;
    });

  return childPages;
};

export const getNotePage = async (id) => {
  const { slugToId } = await getMetadata();
  if (slugToId[id]) {
    id = slugToId[id];
  }
  const pagePromise = notion.pages.retrieve({
    page_id: id,
  });
  const blocksPromise = notion.blocks.children.list({ block_id: id });

  const [page, pageBlocks] = await Promise.all([pagePromise, blocksPromise]);

  if (
    page.parent.type !== "page_id" ||
    page.parent.page_id !== TIL_INDEX_PAGE_ID
  ) {
    // throw new Error("Invalid page ID.");
  }

  const title = page.properties.title.title[0].text.content;
  const mdblocks = await n2m.blocksToMarkdown(pageBlocks.results);
  const markdown = n2m.toMarkdownString(mdblocks);
  return { title, markdown, created_time: page.created_time };
};
