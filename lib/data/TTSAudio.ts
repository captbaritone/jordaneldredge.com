import { db } from "../db";
import { upload } from "../s3";
import fs from "node:fs";

export default class TTSAudio {
  constructor(
    private _contentId: string,
    private _r2Key: string,
    private _lastUpdated: number,
  ) {}

  static fromContentId(contentId: string): TTSAudio | null {
    const audioRow = GET_TTS.get({ contentId: parseInt(contentId, 10) });
    if (audioRow == null) {
      return null;
    }
    return new TTSAudio(
      audioRow.content_id,
      audioRow.r2_key,
      Date.parse(audioRow.last_updated),
    );
  }

  url(): string {
    return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${this._r2Key}`;
  }

  static async upload(contentId: string, mp3Path: string): Promise<TTSAudio> {
    const byteLength = fs.statSync(mp3Path).size;
    const key = `tts/${contentId}.mp3`;
    await upload(key, mp3Path, "audio/mpeg");
    const lastUpdated = Date.now();
    RECORD_TTS.run({
      r2Key: key,
      contentId: parseInt(contentId, 10),
      lastUpdated,
      byteLength,
    });
    return new TTSAudio(contentId, key, lastUpdated);
  }
}

type TTSAudioRow = {
  r2_key: string;
  content_id: string;
  last_updated: string;
  byte_length: string;
};

// const GET_TTS = db.prepare<{ contentId: number }, TTSAudioRow>(
//   `
// SELECT r2_key, content_id, last_updated, byte_length FROM tts WHERE content_id = :contentId;`,
// );

const RECORD_TTS = db.prepare<{
  r2Key: string;
  contentId: number;
  lastUpdated: number;
  byteLength: number;
}>(
  `INSERT INTO tts (r2_key, content_id, last_updated, byte_length) VALUES (:r2Key, :contentId, :lastUpdated, :byteLength);`,
);
