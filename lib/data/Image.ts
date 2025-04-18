import { Int } from "grats";
import { db, sql } from "../db";

/**
 * An image which has been embedded in a piece of content.
 * @gqlType */
export class Image {
  constructor(
    public _src: string,
    /** @gqlField */
    public width?: Int,
    /** @gqlField */
    public height?: Int,
  ) {}

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
      contentImages.push(new Image(row.image_url, row.width, row.height));
    }
    return contentImages;
  }
}

const ALL_IMAGES = db.prepare<
  [],
  { image_url: string; width: number; height: number }
>(sql`
  SELECT
    content_images.image_url,
    width,
    height
  FROM
    content_images
    LEFT JOIN image_metadata ON image_metadata.image_url = content_images.image_url
`);
