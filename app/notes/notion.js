import { Client, LogLevel } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

export const TEN_MINUTES_IN_MS = 1000 * 60 * 10;

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  logLevel: LogLevel.INFO,
});
const n2m = new NotionToMarkdown({ notionClient: notion });

const TIL_INDEX_PAGE_ID = "4817435c-8e47-4d3c-858f-6f5949339ffe";

// A higher order function that returns a curried function that takes a ttl and
// then returns a function that takes the original arguments.
function memoizeWithTTL(fn) {
  const cache = {};
  return (ttl) =>
    (...args) => {
      const key = JSON.stringify(args);
      if (cache[key] == null) {
        cache[key] = { lastCall: 0, lastResult: null };
      }
      const entry = cache[key];

      const now = Date.now();
      if (now - entry.lastCall > ttl) {
        entry.lastResult = fn(...args);
        entry.lastCall = now;
      }
      return entry.lastResult;
    };
}

export const getNotes = memoizeWithTTL(async () => {
  const children = await notion.blocks.children.list({
    block_id: TIL_INDEX_PAGE_ID,
  });

  const childPages = children.results
    .filter((block) => block.type === "child_page")
    .sort((a, b) => {
      return a.created_time > b.created_time ? -1 : 1;
    });

  return childPages;
});

export const getNotePage = memoizeWithTTL(async (id) => {
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
});
