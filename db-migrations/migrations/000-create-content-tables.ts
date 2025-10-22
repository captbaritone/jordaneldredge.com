import { db } from "../../lib/db";
import { SCHEMA } from "../../lib/services/search/CompilerConfig";
import { createSearchIndexWithTriggers } from "search-query-dsl";

/**
 * Migration: Create content tables and related auxiliary tables
 * This migration creates all the tables needed for content management
 */
export async function migrate() {
  console.log("Applying migration: 000-create-content-tables.ts");

  // Create main content table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY,
      page_type TEXT NOT NULL,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      tags TEXT NOT NULL,
      content TEXT NOT NULL,
      DATE TEXT NOT NULL,
      summary_image_path TEXT,
      feed_id TEXT NOT NULL,
      page_rank REAL,
      last_updated INTEGER,
      metadata TEXT,
      UNIQUE (page_type, slug)
    )
  `,
  ).run();

  // Create content_images table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS content_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // Create content_audio table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS content_audio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_id INTEGER NOT NULL,
      audio_url TEXT NOT NULL,
      FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // Create content_links table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS content_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_id INTEGER NOT NULL,
      link_url TEXT NOT NULL,
      FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // Create content_youtube table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS content_youtube (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_id INTEGER NOT NULL,
      youtube_token TEXT NOT NULL,
      FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // Create content_tweets table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS content_tweets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_id INTEGER NOT NULL,
      tweet_status TEXT NOT NULL,
      FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // Create image_metadata table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS image_metadata (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_url TEXT NOT NULL UNIQUE,
      width INTEGER,
      height INTEGER
    )
  `,
  ).run();

  // Create tts table for text-to-speech audio
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS tts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      r2_key TEXT NOT NULL,
      content_id INTEGER NOT NULL UNIQUE,
      last_updated INTEGER NOT NULL,
      byte_length INTEGER NOT NULL,
      FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // Create cdn_images table for tracking uploaded images to CDN
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS cdn_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      r2_key TEXT NOT NULL UNIQUE
    )
  `,
  ).run();

  console.log("Created content auxiliary tables");

  // Create FTS (Full Text Search) table and triggers using search-query-dsl
  const ftsSQL = createSearchIndexWithTriggers(SCHEMA);
  db.exec(ftsSQL);

  console.log("Created FTS table and triggers");
}
