import { Database } from "better-sqlite3";
import betterSqlite from "better-sqlite3";
export { sql } from "./sql";

const filename = process.env.SEARCH_INDEX_LOCATION;
export const db: Database = betterSqlite(filename, {});
db.pragma("journal_mode = WAL");
