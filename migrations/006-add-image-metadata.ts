import "dotenv/config";
import { db, sql } from "../lib/db";

up();

export async function up() {
  db.exec(sql`
    CREATE TABLE image_metadata (
      image_url TEXT NOT NULL,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL
    );
  `);
}
