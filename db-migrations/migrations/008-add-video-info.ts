import { db } from "../../lib/db";

/**
 * Migration: Cache the dimensions and poster frame of embedded video files.
 *
 * Notes turn a link to a video file into a `::video` directive carrying its
 * width, height and poster, so it can be laid out before it loads (vertical
 * videos get the same layout as YouTube Shorts) and used as a summary image.
 * Portrait videos also get a 4:3 thumbnail, framed the way YouTube frames
 * Shorts, for lists and link previews.
 * Finding those means reading the video with ffprobe and ffmpeg, so we record
 * them here, keyed by the video's URL, and only do that once per video.
 */
export async function migrate() {
  console.log("Applying migration: 008-add-video-info.ts");
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS video_info (
      src TEXT PRIMARY KEY,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      poster_key TEXT NOT NULL,
      thumbnail_key TEXT
    )
  `,
  ).run();
  console.log("Created video_info table");
}
