import "dotenv/config";

import { SCHEMA } from "../lib/services/search/CompilerConfig";
import { createSearchIndexWithTriggers } from "search-query-dsl";
import { db, sql } from "../lib/db";

db.exec(sql`
  -- Drop the old FTS table and triggers
  DROP TRIGGER IF EXISTS fts_ai;

  DROP TRIGGER IF EXISTS fts_ad;

  DROP TRIGGER IF EXISTS fts_au;

  DROP TABLE IF EXISTS content_fts_2;
`);
const SQL = createSearchIndexWithTriggers(db, SCHEMA);
