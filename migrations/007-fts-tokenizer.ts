import "dotenv/config";
import { db, sql } from "../lib/db";
import { createSearchIndexWithTriggers } from "../lib/services/search/CreateFtsTable";
import { SCHEMA } from "../lib/services/search/CompilerConfig";

up();

// Bond... James Bond

export async function up() {
  createSearchIndexWithTriggers(db, SCHEMA);
  db.exec(sql`
    -- Drop the old FTS table and triggers
    DROP TRIGGER IF EXISTS content_ai;

    DROP TRIGGER IF EXISTS content_ad;

    DROP TRIGGER IF EXISTS content_au;

    DROP TABLE IF EXISTS content_fts;
  `);
}
