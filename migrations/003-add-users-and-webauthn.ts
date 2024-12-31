import "dotenv/config";
import { db, sql } from "../lib/db";

up();

export async function up() {
  db.exec(sql`
    -- Table to store user information
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for the user
      username TEXT UNIQUE NOT NULL, -- Username or email (must be unique)
      display_name TEXT, -- User-friendly name
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- Timestamp for record creation
    );

    -- Table to store WebAuthn credentials
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

    -- Table to store WebAuthn challenges
    -- CREATE TABLE webauthn_challenges (
    --   id INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for the challenge
    --   user_id INTEGER, -- Foreign key to 'users' table (nullable for unauthenticated users)
    --   challenge TEXT NOT NULL, -- Base64URL-encoded challenge
    --   expires_at DATETIME NOT NULL, -- Expiration time for the challenge
    --   FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    -- );
  `);
}
