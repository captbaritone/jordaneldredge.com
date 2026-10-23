import { db } from "../../lib/db";

/**
 * Migration: Record a hash of the text each TTS recording was made from.
 *
 * `scripts/audio.ts` used to decide whether audio was stale by comparing its
 * timestamp to the content's `last_updated`, which moves whenever a Notion
 * property is edited or a post's file is touched, even when the words are the
 * same. With the hash it only re-records when the spoken text changes.
 *
 * Existing rows start out NULL; the audio script adopts the current hash for
 * them rather than re-recording.
 */
export async function migrate() {
  console.log("Applying migration: 007-add-tts-text-hash.ts");
  db.prepare(`ALTER TABLE tts ADD COLUMN text_hash TEXT`).run();
  console.log("Added text_hash column to tts");
}
