import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as Api from "./api";

// sqlite-utils enable-fts search-index.db search_index title content --create-triggers --replace

const CREATE_TABLE = `
CREATE TABLE search_index (
  page_type TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  UNIQUE(page_type, slug)
);
CREATE VIRTUAL TABLE [search_index_fts] USING FTS5 (
  [title], [content],
  content=[search_index]
)
/* search_index_fts(title,content) */;
CREATE TABLE IF NOT EXISTS 'search_index_fts_data'(id INTEGER PRIMARY KEY, block BLOB);
CREATE TABLE IF NOT EXISTS 'search_index_fts_idx'(segid, term, pgno, PRIMARY KEY(segid, term)) WITHOUT ROWID;
CREATE TABLE IF NOT EXISTS 'search_index_fts_docsize'(id INTEGER PRIMARY KEY, sz BLOB);
CREATE TABLE IF NOT EXISTS 'search_index_fts_config'(k PRIMARY KEY, v) WITHOUT ROWID;
CREATE TRIGGER [search_index_ai] AFTER INSERT ON [search_index] BEGIN
INSERT INTO [search_index_fts] (rowid, [title], [content]) VALUES (new.rowid, new.[title], new.[content]);
END;
CREATE TRIGGER [search_index_ad] AFTER DELETE ON [search_index] BEGIN
INSERT INTO [search_index_fts] ([search_index_fts], rowid, [title], [content]) VALUES('delete', old.rowid, old.[title], old.[content]);
END;
CREATE TRIGGER [search_index_au] AFTER UPDATE ON [search_index] BEGIN
INSERT INTO [search_index_fts] ([search_index_fts], rowid, [title], [content]) VALUES('delete', old.rowid, old.[title], old.[content]);
INSERT INTO [search_index_fts] (rowid, [title], [content]) VALUES (new.rowid, new.[title], new.[content]);
END;
`;

export async function getDb() {
  return await open({
    filename: process.env.SEARCH_INDEX_LOCATION,
    driver: sqlite3.Database,
  });
}

async function index(db) {
  // await db.exec(CREATE_TABLE);

  const posts = await Api.getAllPosts([
    "title",
    "date",
    "slug",
    "author",
    "coverImage",
    "content",
  ]);

  for (const post of posts) {
    indexEntry(db, { pageType: "post", ...post });
  }

  const pages = Api.getAllPages(["title", "slug", "content"]);

  for (const page of pages) {
    indexEntry(db, { pageType: "page", ...page });
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
WHERE search_index_fts.content MATCH ?
ORDER BY rank
LIMIT 20;`,
    [`"${query}" *`]
  );
}

export async function indexEntry(db, { pageType, title, content, slug }) {
  if (title == null || pageType == null || slug == null) {
    console.error({ pageType, slug });
    throw new Error("No title!");
  }
  await db.run(
    `
INSERT INTO search_index (
  page_type, title, content, slug
) VALUES (?, ?, ?, ?) ON CONFLICT(page_type, slug) DO UPDATE SET title = ?, content = ?`,
    [pageType, title, content, slug, title, content]
  );
}
