import { Database } from "sqlite";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as Data from "./data";

export async function getDb(): Promise<Database> {
  const filename = process.env.SEARCH_INDEX_LOCATION;
  if (!filename) {
    throw new Error("No SEARCH_INDEX_LOCATION set");
  }
  return await open({ filename, driver: sqlite3.Database });
}

export async function reindex(db: Database) {
  console.log("REINDEX");

  const posts = Data.getAllPosts();
  const pages = Data.getAllPages();
  const notes = await Data.getAllNotes();

  const indexable = [...posts, ...pages, ...notes];

  for (const entry of indexable) {
    await indexEntry(db, entry);
  }
}

export async function search(db: Database, query: string) {
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

export async function indexEntry(db: Database, indexable: Data.Indexable) {
  const markdown = await indexable.content();
  const title = indexable.title();
  const content = markdown.markdownString();
  await db.run(
    `
INSERT INTO search_index (
  page_type, title, content, slug
) VALUES (?, ?, ?, ?) ON CONFLICT(page_type, slug) DO UPDATE SET title = ?, content = ?`,
    [indexable.pageType, title, content, indexable.slug(), title, content]
  );
}
