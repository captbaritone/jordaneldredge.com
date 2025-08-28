"use server";

import { db } from "../../../../lib/db";

/**
 * Helper action to check if the last_login column exists in the users table
 * This is used by the users page to verify the migration has run
 */
export async function checkLastLoginColumn(): Promise<boolean> {
  const tableInfo = db.prepare("PRAGMA table_info(users)").all() as Array<{
    name: string;
  }>;
  return tableInfo.some((column) => column.name === "last_login");
}
