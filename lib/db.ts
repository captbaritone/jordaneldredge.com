import { Database } from "better-sqlite3";
import betterSqlite from "better-sqlite3";
import "dotenv/config";
export { sql } from "./sql";

const filename = process.env.SEARCH_INDEX_LOCATION;
if (!filename) {
  throw new Error("SEARCH_INDEX_LOCATION must be set");
}
export const db: Database = betterSqlite(filename, {});
db.pragma("journal_mode = WAL");
