import "dotenv/config";
import { getDb } from "../lib/search.mjs";

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
);
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

async function main() {
  const db = await getDb();

  await db.exec(CREATE_TABLE);
}

main();
