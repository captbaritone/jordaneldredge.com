import { sql, prepare } from "../db";

/**
 * An audio file which has been embedded in a piece of content.
 * @gqlType */
export class AudioFile {
  constructor(
    /** @gqlField */
    public src: string,
  ) {}

  /** @gqlField */
  url(): string {
    return this.src;
  }

  /** @gqlQueryField */
  static audioFiles(): Array<AudioFile> {
    const audios = prepare<[], { audio_url: string }>(sql`
      SELECT
        audio_url
      FROM
        content_audio
    `).all();
    return audios.map((row) => new AudioFile(row.audio_url));
  }
}
