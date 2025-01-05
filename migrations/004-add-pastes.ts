import "dotenv/config";
import { db, sql } from "../lib/db";

up();

export async function up() {
  db.exec(sql`
    -- Table to store user information
    CREATE TABLE pastes (
      id INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for the paste
      author_id TEXT,
      content TEXT NOT NULL,
      file_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);
}
