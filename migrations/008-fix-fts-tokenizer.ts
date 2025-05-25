import "dotenv/config";
import { db, sql } from "../lib/db";
import { createSearchIndexWithTriggers } from "../lib/services/search/CreateFtsTable";
import { SCHEMA } from "../lib/services/search/CompilerConfig";

up();

export async function up() {
  db.exec(sql`
    DROP TRIGGER IF EXISTS fts_au;

    CREATE TRIGGER [fts_au] AFTER
    UPDATE ON [content] BEGIN
    INSERT INTO
      [content_fts_2] (
        [content_fts_2],
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
      [content_fts_2] (rowid, [title], [summary], [tags], [content])
    VALUES
      (
        new.rowid,
        new.[title],
        new.[summary],
        new.[tags],
        new.[content]
      );

    END;
  `);
}
