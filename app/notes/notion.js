import { Client, LogLevel } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  // logLevel: LogLevel.DEBUG,
});
const n2m = new NotionToMarkdown({ notionClient: notion });

const TIL_INDEX_PAGE_ID = "4817435c-8e47-4d3c-858f-6f5949339ffe";

export async function getTilPages() {
  const children = await notion.blocks.children.list({
    block_id: TIL_INDEX_PAGE_ID,
  });

  const childPages = children.results
    .filter((block) => block.type === "child_page")
    .sort((a, b) => {
      return a.created_time > b.created_time ? -1 : 1;
    });

  return childPages;
}

export async function getTilPage(id) {
  const pagePromise = notion.pages.retrieve({
    page_id: id,
  });
  const blocksPromise = notion.blocks.children.list({ block_id: id });

  const [page, pageBlocks] = await Promise.all([pagePromise, blocksPromise]);

  if (
    page.parent.type !== "page_id" ||
    page.parent.page_id !== TIL_INDEX_PAGE_ID
  ) {
    throw new Error("Invalid page ID.");
  }

  const title = page.properties.title.title[0].text.content;
  const mdblocks = await n2m.blocksToMarkdown(pageBlocks.results);
  const markdown = n2m.toMarkdownString(mdblocks);
  return { title, markdown, created_time: page.created_time };
}
