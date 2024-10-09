-- sqlite-utils enable-fts search-index.db search_index title content --create-triggers --replace
-- And then evolved to add more fields
CREATE TABLE search_index (
  page_type TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  tags TEXT NOT NULL, -- Space deliniated list
  content TEXT NOT NULL,
  date: TEXT NOT NULL, -- YYYY-MM-DD
  summary_image_path: TEXT, -- path relative to jordaneldredge.com/
  feed_id: TEXT NOT NULL, -- for notes this is the Notion UUID
  UNIQUE(page_type, slug)
);
CREATE VIRTUAL TABLE [search_index_fts] USING FTS5 (
  [title], [summary], [tags], [content],
  content=[search_index]
)
/* search_index_fts(title,summary,tags,content) */;
CREATE TABLE IF NOT EXISTS 'search_index_fts_data'(id INTEGER PRIMARY KEY, block BLOB);
CREATE TABLE IF NOT EXISTS 'search_index_fts_idx'(segid, term, pgno, PRIMARY KEY(segid, term)) WITHOUT ROWID;
CREATE TABLE IF NOT EXISTS 'search_index_fts_docsize'(id INTEGER PRIMARY KEY, sz BLOB);
CREATE TABLE IF NOT EXISTS 'search_index_fts_config'(k PRIMARY KEY, v) WITHOUT ROWID;
CREATE TRIGGER [search_index_ai] AFTER INSERT ON [search_index] BEGIN
INSERT INTO [search_index_fts] (rowid, [title], [summary], [tags], [content]) VALUES (new.rowid, new.[title], new.[summary], new.[tags], new.[content]);
END;
CREATE TRIGGER [search_index_ad] AFTER DELETE ON [search_index] BEGIN
INSERT INTO [search_index_fts] ([search_index_fts], rowid, [title], [summary], [tags], [content]) VALUES('delete', old.rowid, old.[title], old.[summary], old.[tags], old.[content]);
END;
CREATE TRIGGER [search_index_au] AFTER UPDATE ON [search_index] BEGIN
INSERT INTO [search_index_fts] ([search_index_fts], rowid, [title], [summary], [tags], [content]) VALUES('delete', old.rowid, old.[title], old.[summary], old.[tags], old.[content]);
INSERT INTO [search_index_fts] (rowid, [title], [summary], [tags], [content]) VALUES (new.rowid, new.[title], new.[summary], new.[tags], new.[content]);
END;