import { db } from "../../lib/db";

export async function migrate() {
  // Check if the column already exists
  const tableInfo = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
  const hasLastLogin = tableInfo.some(column => column.name === "last_login");
  
  if (!hasLastLogin) {
    // Add the last_login column to the users table
    db.prepare(`
      ALTER TABLE users 
      ADD COLUMN last_login TEXT
    `).run();
    
    console.log("Added last_login column to users table");
  } else {
    console.log("last_login column already exists in users table");
  }
}

export async function rollback() {
  // Since SQLite doesn't support dropping columns directly,
  // we would need to recreate the table without the column.
  // For safety, we'll make this a no-op
  console.log("Rollback not implemented for this migration (SQLite limitations)");
}
