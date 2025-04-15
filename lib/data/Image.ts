import { db, sql } from "../db";

/**
 * An image which has been embedded in a piece of content.
 * @gqlType */
export class Image {
  constructor(public _src: string) {}

  /** @gqlField */
  src(): string {
    if (this._src.startsWith("/")) {
      return `https://jordaneldredge.com${this._src}`;
    }
    return this._src;
  }

  /** @gqlQueryField */
  static images(): Array<Image> {
    const images = ALL_IMAGES.all();
    const contentImages: Array<Image> = [];
    for (const row of images) {
      contentImages.push(new Image(row.image_url));
    }
    return contentImages;
  }
}

const ALL_IMAGES = db.prepare<[], { image_url: string }>(sql`
  SELECT
    image_url
  FROM
    content_images
`);
