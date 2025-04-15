import { db, sql } from "../db";

/**
 * A Youtube video which has been embedded in a piece of content.
 * @gqlType */
export class YoutubeVideo {
  constructor(
    /** @gqlField */
    public token: string,
    /** @gqlField */
    public vertical?: boolean,
  ) {}

  /** @gqlField */
  embedUrl(): string {
    return `https://www.youtube.com/embed/${this.token}`;
  }

  /** @gqlField */
  url(): string {
    return `https://www.youtube.com/watch?v=${this.token}`;
  }

  /** @gqlField */
  thumbnailUrl(): string {
    return `https://img.youtube.com/vi/${this.token}/hqdefault.jpg`;
  }

  /** @gqlQueryField */
  static youtubeVideos(): Array<YoutubeVideo> {
    const youtubeVideos = ALL_YOUTUBE.all();
    return youtubeVideos.map((row) => new YoutubeVideo(row.youtube_token));
  }
}

const ALL_YOUTUBE = db.prepare<[], { youtube_token: string }>(sql`
  SELECT
    youtube_token
  FROM
    content_youtube
`);
