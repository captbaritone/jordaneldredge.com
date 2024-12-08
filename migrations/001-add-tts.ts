import "dotenv/config";
import { db } from "../lib/db";
import { list } from "../lib/s3";

up();

export async function up() {
  db.prepare(
    `CREATE TABLE IF NOT EXISTS tts (
    id INTEGER PRIMARY KEY,
    r2_key TEXT NOT NULL,
    content_id INTEGER NOT NULL,
    last_updated INTEGER NOT NULL,
    byte_length INTEGER NOT NULL,
    FOREIGN KEY(content_id) REFERENCES content(id)
  );`,
  ).run();

  for (const { key, byteSize } of await list()) {
    const contentId = parseInt(key.split("/")[1].split(".")[0], 10);
    if (!contentId) {
      console.log(`Skipping ${key}`);
      continue;
    }

    db.prepare(
      `INSERT INTO tts (r2_key, content_id, last_updated, byte_length) VALUES (:r2Key, :contentId, :lastUpdated, :byteLength);`,
    ).run({
      r2Key: key,
      contentId,
      lastUpdated: Date.now(),
      byteLength: byteSize,
    });
  }
}
