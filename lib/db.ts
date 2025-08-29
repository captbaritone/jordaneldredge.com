import { Database, Statement } from "better-sqlite3";
import betterSqlite from "better-sqlite3";
import "dotenv/config";
import { Sql } from "./sql";
export { sql } from "./sql";

const filename = process.env.SEARCH_INDEX_LOCATION;
if (!filename) {
  throw new Error("SEARCH_INDEX_LOCATION must be set");
}
export const db: Database = betterSqlite(filename, {});
db.pragma("journal_mode = WAL");

/**
 * A cache for prepared statements to avoid preparing the same statement multiple times.
 * This implements a lazy loading pattern where statements are only prepared when
 * they are first used, then cached for future use.
 */
const preparedStatementCache = new Map<string, Statement>();

/**
 * Helper function to get a prepared statement from cache or prepare and cache it.
 * Preserves the type parameters from better-sqlite3 for full type safety.
 * @param sql The SQL query to prepare
 * @returns The prepared statement with proper typing
 */
export function prepare<
  BindParameters extends unknown[] | {} = unknown[],
  Result = unknown,
>(
  sql: Sql,
): BindParameters extends unknown[]
  ? Statement<BindParameters, Result>
  : Statement<[BindParameters], Result> {
  if (!preparedStatementCache.has(sql)) {
    preparedStatementCache.set(sql, db.prepare(sql));
  }
  // Type assertion needed here since we can't easily make the Map type-safe with the complex conditional type
  return preparedStatementCache.get(sql)! as any;
}
