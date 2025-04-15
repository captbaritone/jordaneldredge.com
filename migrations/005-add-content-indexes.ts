import "dotenv/config";
import { db, sql } from "../lib/db";

up();

export async function up() {
  db.exec(sql`
    CREATE TABLE content_images (
      content_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      FOREIGN KEY (content_id) REFERENCES content (id) ON DELETE CASCADE
    );

    CREATE TABLE content_links (
      content_id INTEGER NOT NULL,
      link_url TEXT NOT NULL,
      FOREIGN KEY (content_id) REFERENCES content (id) ON DELETE CASCADE
    );

    CREATE TABLE content_youtube (
      content_id INTEGER NOT NULL,
      youtube_token TEXT NOT NULL,
      FOREIGN KEY (content_id) REFERENCES content (id) ON DELETE CASCADE
    );

    CREATE TABLE content_audio (
      content_id INTEGER NOT NULL,
      audio_url TEXT NOT NULL,
      FOREIGN KEY (content_id) REFERENCES content (id) ON DELETE CASCADE
    );

    CREATE TABLE content_tweets (
      content_id INTEGER NOT NULL,
      tweet_status TEXT NOT NULL,
      FOREIGN KEY (content_id) REFERENCES content (id) ON DELETE CASCADE
    );
  `);
}
