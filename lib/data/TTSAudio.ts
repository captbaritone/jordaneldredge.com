import { db } from "../db";
import { keyUrl, upload } from "../s3";
import fs from "node:fs";
import Content from "./Content";
import { SiteUrl } from "./SiteUrl";

export default class TTSAudio {
  constructor(
    private _contentId: string,
    private _r2Key: string,
    private _lastUpdated: number,
    private _byteLength: number,
  ) {}

  static fromContentId(contentId: string): TTSAudio | null {
    const audioRow = GET_TTS.get({ contentId: parseInt(contentId, 10) });
    if (audioRow == null) {
      return null;
    }
    return new TTSAudio(
      audioRow.content_id,
      audioRow.r2_key,
      audioRow.last_updated,
      audioRow.byte_length,
    );
  }

  content(): Content {
    const content = Content.getById(parseInt(this._contentId, 10));
    if (content == null) {
      throw new Error(`Content not found for TTSAudio ${this._contentId}`);
    }
    return content;
  }

  vanityUrl(): SiteUrl {
    return new SiteUrl(this.content().url().path() + ".mp3");
  }

  url(): string {
    return keyUrl(this._r2Key);
  }

  byteLength(): number {
    return this._byteLength;
  }

  lastUpdated(): number {
    return this._lastUpdated;
  }

  static async upload(contentId: string, mp3Path: string): Promise<TTSAudio> {
    const byteLength = fs.statSync(mp3Path).size;
    const key = `tts/${contentId}.mp3`;
    await upload(key, mp3Path, "audio/mpeg");
    const lastUpdated = Date.now();
    const update = db.transaction(() => {
      DELETE_TTS_FOR_CONTENT.run({ contentId: parseInt(contentId, 10) });
      RECORD_TTS.run({
        r2Key: key,
        contentId: parseInt(contentId, 10),
        lastUpdated,
        byteLength,
      });
    });
    update();
    return new TTSAudio(contentId, key, lastUpdated, byteLength);
  }
}

type TTSAudioRow = {
  r2_key: string;
  content_id: string;
  last_updated: number;
  byte_length: number;
};

const GET_TTS = db.prepare<{ contentId: number }, TTSAudioRow>(
  `
SELECT r2_key, content_id, last_updated, byte_length FROM tts WHERE content_id = :contentId;`,
);

const RECORD_TTS = db.prepare<{
  r2Key: string;
  contentId: number;
  lastUpdated: number;
  byteLength: number;
}>(
  `
  INSERT INTO tts (r2_key, content_id, last_updated, byte_length) VALUES (:r2Key, :contentId, :lastUpdated, :byteLength);`,
);

const DELETE_TTS_FOR_CONTENT = db.prepare<{ contentId: number }>(
  `DELETE FROM tts WHERE content_id = :contentId;`,
);
