import "dotenv/config";

import { Database } from "better-sqlite3";
import betterSqlite from "better-sqlite3";
import { sql } from "../lib/sql";

// We purposefully avoid importing db or any other module that instantiates the
// DB as a side effect of importing
const filename = process.env.SEARCH_INDEX_LOCATION;
const db: Database = betterSqlite(filename, {});
db.pragma("journal_mode = WAL");

// sqlite-utils enable-fts search-index.db search_index title content --create-triggers --replace

const CREATE_TABLE = sql`
  CREATE TABLE search_index (
    id INTEGER PRIMARY KEY,
    page_type TEXT NOT NULL,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    tags TEXT NOT NULL,
    content TEXT NOT NULL,
    DATE TEXT NOT NULL,
    summary_image_path TEXT,
    feed_id TEXT NOT NULL,
    page_rank REAL,
    last_updated INTEGER,
    metadata TEXT, -- TODO: Could use jsonb
    UNIQUE (page_type, slug)
  );

  CREATE VIRTUAL TABLE [search_index_fts] USING FTS5 (
    [title],
    [summary],
    [tags],
    [content],
    content = [search_index]
  );

  CREATE TRIGGER [search_index_ai] AFTER INSERT ON [search_index] BEGIN
  INSERT INTO
    [search_index_fts] (rowid, [title], [summary], [tags], [content])
  VALUES
    (
      new.rowid,
      new.[title],
      new.[summary],
      new.[tags],
      new.[content]
    );

  END;

  CREATE TRIGGER [search_index_ad] AFTER DELETE ON [search_index] BEGIN
  INSERT INTO
    [search_index_fts] (
      [search_index_fts],
      rowid,
      [title],
      [summary],
      [tags],
      [content]
    )
  VALUES
    (
      'delete',
      old.rowid,
      old.[title],
      old.[summary],
      old.[tags],
      old.[content]
    );

  END;

  CREATE TRIGGER [search_index_au] AFTER
  UPDATE ON [search_index] BEGIN
  INSERT INTO
    [search_index_fts] (
      [search_index_fts],
      rowid,
      [title],
      [summary],
      [tags],
      [content]
    )
  VALUES
    (
      'delete',
      old.rowid,
      old.[title],
      old.[summary],
      old.[tags],
      old.[content]
    );

  INSERT INTO
    [search_index_fts] (rowid, [title], [summary], [tags], [content])
  VALUES
    (
      new.rowid,
      new.[title],
      new.[summary],
      new.[tags],
      new.[content]
    );

  END;
`;

async function main() {
  const filename = process.env.SEARCH_INDEX_LOCATION;
  if (!filename) {
    throw new Error("No SEARCH_INDEX_LOCATION set");
  }
  db.exec(sql`
    DROP TABLE IF EXISTS search_index;

    DROP TABLE IF EXISTS search_index_fts;

    DROP TRIGGER IF EXISTS search_index_ai;

    DROP TRIGGER IF EXISTS search_index_ad;
  `);

  db.exec(CREATE_TABLE);

  const Search = await import("../lib/search");
  await Search.reindex({ force: true });
}

main();
