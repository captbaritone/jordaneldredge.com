import { db } from "../../lib/db";

/**
 * Migration: Create pastes table for storing user pastes
 */
export async function migrate() {
  console.log("Applying migration: 004-add-pastes.ts");

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS pastes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_id TEXT,
      content TEXT NOT NULL,
      file_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `,
  ).run();

  console.log("Created pastes table");
}
