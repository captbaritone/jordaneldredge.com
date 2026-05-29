import { db } from "../../lib/db";

/**
 * Migration: Rebuild `pastes` so that `author_id` is INTEGER instead of TEXT.
 *
 * Existing values were stored as text floats like "6.0" / "4.0", which made
 * `WHERE author_id = ?` (with an integer binding) return zero rows — breaking
 * the edit page, the "your pastes" list, and the GraphQL `myPastes` query.
 */
export async function migrate() {
  console.log("Applying migration: 006-fix-paste-author-id-type.ts");

  // Foreign key enforcement can't be toggled inside a transaction.
  db.pragma("foreign_keys = OFF");

  try {
    const rebuild = db.transaction(() => {
      db.prepare(
        `
        CREATE TABLE pastes_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          author_id INTEGER,
          content TEXT NOT NULL,
          file_name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `,
      ).run();

      db.prepare(
        `
        INSERT INTO pastes_new (id, author_id, content, file_name, created_at)
        SELECT id, CAST(author_id AS INTEGER), content, file_name, created_at
        FROM pastes
      `,
      ).run();

      db.prepare(`DROP TABLE pastes`).run();
      db.prepare(`ALTER TABLE pastes_new RENAME TO pastes`).run();
    });

    rebuild();
  } finally {
    db.pragma("foreign_keys = ON");
  }

  console.log("Rebuilt pastes table with INTEGER author_id");
}
