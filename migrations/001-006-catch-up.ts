import "dotenv/config";
import { db, sql } from "../lib/db";

up();

export async function up() {
  db.exec(sql`
    CREATE TABLE content (
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
      metadata TEXT, -- TODO: Could use jsonb
      UNIQUE (page_type, slug)
    );

    CREATE TABLE IF NOT EXISTS 'content_fts_data' (id INTEGER PRIMARY KEY, block BLOB);

    CREATE TABLE IF NOT EXISTS 'content_fts_idx' (segid, term, pgno, PRIMARY KEY (segid, term)) WITHOUT ROWID;

    CREATE TABLE IF NOT EXISTS 'content_fts_docsize' (id INTEGER PRIMARY KEY, sz BLOB);

    CREATE TABLE IF NOT EXISTS 'content_fts_config' (k PRIMARY KEY, v) WITHOUT ROWID;

    CREATE TABLE tts (
      id INTEGER PRIMARY KEY,
      r2_key TEXT NOT NULL,
      content_id INTEGER NOT NULL UNIQUE,
      last_updated INTEGER NOT NULL,
      byte_length INTEGER NOT NULL,
      FOREIGN KEY (content_id) REFERENCES content (id)
    );

    CREATE TABLE cdn_images (
      id INTEGER PRIMARY KEY,
      r2_key TEXT NOT NULL UNIQUE
    );

    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for the user
      username TEXT UNIQUE NOT NULL, -- Username or email (must be unique)
      display_name TEXT, -- User-friendly name
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- Timestamp for record creation
    );

    CREATE TABLE webauthn_credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for the credential
      user_id INTEGER NOT NULL, -- Foreign key to 'users' table
      credential_id TEXT UNIQUE NOT NULL, -- Base64URL-encoded credential ID
      public_key TEXT NOT NULL, -- Base64URL-encoded public key
      sign_count INTEGER NOT NULL DEFAULT 0, -- Signature counter to prevent replay attacks
      transports TEXT, -- Supported transports (e.g., 'usb', 'nfc')
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp for credential creation
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE pastes (
      id INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for the paste
      author_id TEXT,
      content TEXT NOT NULL,
      file_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE VIRTUAL TABLE [content_fts] USING FTS5 (
      [title],
      [summary],
      [tags],
      [content],
      content = [content]
    )
    /* content_fts(title,summary,tags,content) */;

    CREATE TRIGGER [content_ai] AFTER INSERT ON [content] BEGIN
    INSERT INTO
      [content_fts] (rowid, [title], [summary], [tags], [content])
    VALUES
      (
        new.rowid,
        new.[title],
        new.[summary],
        new.[tags],
        new.[content]
      );

    END;

    CREATE TRIGGER [content_ad] AFTER DELETE ON [content] BEGIN
    INSERT INTO
      [content_fts] (
        [content_fts],
        rowid,
        [title],
        [summary],
        [tags],
        [content]
      )
    VALUES
      (
        'delete',
        old.rowid,
        old.[title],
        old.[summary],
        old.[tags],
        old.[content]
      );

    END;

    CREATE TRIGGER [content_au] AFTER
    UPDATE ON [content] BEGIN
    INSERT INTO
      [content_fts] (
        [content_fts],
        rowid,
        [title],
        [summary],
        [tags],
        [content]
      )
    VALUES
      (
        'delete',
        old.rowid,
        old.[title],
        old.[summary],
        old.[tags],
        old.[content]
      );

    INSERT INTO
      [content_fts] (rowid, [title], [summary], [tags], [content])
    VALUES
      (
        new.rowid,
        new.[title],
        new.[summary],
        new.[tags],
        new.[content]
      );

    END;

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

    CREATE TABLE image_metadata (
      image_url TEXT NOT NULL,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL
    );
  `);
}
