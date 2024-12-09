import path from "node:path";
import { db } from "../../db";
import { uploadFromUrl } from "../../s3";

export function keyForYoutubeThumbnail(token: string) {
  return path.join("youtube", `${token}.jpg`);
}

export async function ensureYoutubeImage(token: string) {
  const summaryImage = `https://img.youtube.com/vi/${token}/hqdefault.jpg`;
  const r2_key = keyForYoutubeThumbnail(token);
  await maybeUploadImage(r2_key, summaryImage);
}

export async function maybeUploadImage(r2_key: string, url: string) {
  if (R2_KEY_EXISTS.get({ r2_key })) {
    return;
  }
  await uploadFromUrl(r2_key, url);
  ADD_R2_KEY.run({ r2_key });
}

const R2_KEY_EXISTS = db.prepare<{ r2_key: string }, 1>(`
    SELECT 1 FROM cdn_images WHERE r2_key = :r2_key`);
const ADD_R2_KEY = db.prepare<{ r2_key: string }, 1>(`
    INSERT INTO cdn_images (r2_key) VALUES (:r2_key)`);
