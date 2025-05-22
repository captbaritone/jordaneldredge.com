import "dotenv/config";
import { db, sql } from "../lib/db";
import { createSearchIndexWithTriggers } from "../lib/services/search/CreateFtsTable";

up();

// Bond... James Bond

export async function up() {
  createSearchIndexWithTriggers(db, "content_fts_2", "content", [
    "title",
    "summary",
    "tags",
    "content",
  ]);
  db.exec(sql`
    -- Drop the old FTS table and triggers
    DROP TRIGGER IF EXISTS content_ai;

    DROP TRIGGER IF EXISTS content_ad;

    DROP TRIGGER IF EXISTS content_au;

    DROP TABLE IF EXISTS content_fts;
  `);
}
