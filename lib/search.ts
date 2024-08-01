import { Database } from "sqlite";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as Data from "./data";

let db: Promise<Database> | null = null;

export async function getDb(): Promise<Database> {
  if (db != null) {
    console.log("Cached db");
    return await db;
  }
  const filename = process.env.SEARCH_INDEX_LOCATION;
  if (!filename) {
    throw new Error("No SEARCH_INDEX_LOCATION set");
  }
  db = open({ filename, driver: sqlite3.Database });
  return await db;
}

export async function reindex(db: Database) {
  console.log("REINDEX");

  const posts = Data.getAllPosts();
  const notes = await Data.getAllNotes();

  const indexable = [...posts, ...notes];

  for (const entry of indexable) {
    await indexEntry(db, entry);
  }

  await scrub(db, posts, notes);
}

//
async function scrub(db: Database, posts: Data.Post[], notes: Data.Note[]) {
  const postUrls = posts.map((p) => p.url().path());
  const noteUrls = notes.map((n) => n.url().path());

  const indexableUrlPaths = new Set([...postUrls, ...noteUrls]);

  // For each current index entry, check if the slug is valid:
  const entries = await db.all(`SELECT slug, page_type FROM search_index;`);

  for (const entry of entries) {
    const topLevelDir = entry.page_type === "post" ? "blog" : "notes";
    const entryPath = `/${topLevelDir}/${entry.slug}`;
    if (!indexableUrlPaths.has(entryPath)) {
      console.log("SCRUB", entryPath);
      await db.run(
        `DELETE FROM search_index WHERE slug = ? AND page_type = ?;`,
        [entry.slug, entry.page_type]
      );
    }
  }
}

export async function search(db: Database, query: string) {
  return await db.all(
    `
SELECT
  search_index.slug,
  search_index.page_type,
  search_index.summary,
  search_index.tags,
  search_index.title
FROM search_index_fts
LEFT JOIN search_index ON search_index.rowid = search_index_fts.rowid
WHERE search_index_fts MATCH ?
ORDER BY rank
LIMIT 20;`,
    [
      `title:"${query}" * OR content:"${query}" * OR tags:"${query}" * OR summary:"${query}" *`,
    ]
  );
}

export async function indexEntry(db: Database, indexable: Data.Indexable) {
  console.log("INDEXING", indexable.slug());
  const markdown = await indexable.content();
  const title = indexable.title();
  const summary = indexable.summary == null ? "" : indexable.summary() || "";
  const tags = indexable
    .tagSet()
    .tags()
    .map((t) => t.name())
    .join(" ");
  const content = await markdown.markdownString();
  await db.run(
    `
INSERT INTO search_index (
  page_type, title, summary, tags, content, slug
) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(page_type, slug) DO UPDATE SET title = ?, summary = ?, tags = ?, content = ?;`,
    [
      indexable.pageType,
      title,
      summary,
      tags,
      content,
      indexable.slug(),
      title,
      summary,
      tags,
      content,
    ]
  );
}
