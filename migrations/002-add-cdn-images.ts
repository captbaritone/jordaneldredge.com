import "dotenv/config";
import { db } from "../lib/db";

up();

export async function up() {
  db.prepare(
    `CREATE TABLE IF NOT EXISTS cdn_images (
    id INTEGER PRIMARY KEY,
    r2_key TEXT NOT NULL UNIQUE
  );`,
  ).run();
}
