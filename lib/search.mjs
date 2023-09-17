import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as Api from "./api.mjs";
import { getNotes, getNotePage } from "../app/notes/notion.mjs";

export async function getDb() {
  return await open({
    filename: process.env.SEARCH_INDEX_LOCATION,
    driver: sqlite3.Database,
  });
}

export async function reindex(db) {
  console.log("REINDEX");

  const posts = await Api.getAllPosts([
    "title",
    "date",
    "slug",
    "author",
    "coverImage",
    "content",
  ]);

  for (const post of posts) {
    await indexEntry(db, { pageType: "post", ...post });
  }

  const pages = Api.getAllPages(["title", "slug", "content"]);

  for (const page of pages) {
    console.log(`Reindexing page: ${page.title}`);
    await indexEntry(db, { pageType: "page", ...page });
  }
  console.log("REINDEX NOTES");

  const notes = await getNotes();
  for (const note of notes) {
    const { title, markdown, created_time } = await getNotePage(note.id);
    console.log(`Reindexing note: ${title}`);
    await indexEntry(db, {
      pageType: "note",
      title,
      slug: note.id,
      content: markdown,
    });
  }
}

export async function search(db, query) {
  return await db.all(
    `
SELECT
  search_index.slug,
  search_index.page_type,
  search_index.title
FROM search_index_fts
LEFT JOIN search_index ON search_index.rowid = search_index_fts.rowid
WHERE search_index_fts MATCH ?
ORDER BY rank
LIMIT 20;`,
    [`title:"${query}" * OR content:"${query}" *`]
  );
}

export async function indexEntry(db, { pageType, title, content, slug }) {
  if (title == null || pageType == null || slug == null) {
    // console.error({ pageType, slug });
    // throw new Error("No title!");
  }
  await db.run(
    `
INSERT INTO search_index (
  page_type, title, content, slug
) VALUES (?, ?, ?, ?) ON CONFLICT(page_type, slug) DO UPDATE SET title = ?, content = ?`,
    [pageType, title || "", content, slug, title || "", content]
  );
}
