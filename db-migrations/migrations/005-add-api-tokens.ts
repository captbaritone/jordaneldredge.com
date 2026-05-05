import { db } from "../../lib/db";

export async function migrate() {
  console.log("Applying migration: 005-add-api-tokens.ts");

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS api_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `,
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS cli_auth_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      token TEXT,
      user_id INTEGER,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL
    )
  `,
  ).run();

  console.log("Created api_tokens and cli_auth_requests tables");
}
