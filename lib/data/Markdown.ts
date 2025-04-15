import { map } from "unist-util-map";
import { Node } from "unist";
import { visit } from "unist-util-visit";
import remarkInlineLinks from "remark-inline-links";
import { toMarkdown, Options } from "mdast-util-to-markdown";
import { fixHtml, syntaxHighlighting, parse } from "./markdownUtils";
import { sql } from "../sql";
import { db } from "../db";
import { Tweet } from "./Tweet";
import { YoutubeVideo } from "./YoutubeVideo";
import { AudioFile } from "./AudioFile";
import { Image } from "./Image";
import { Link } from "./Link";

/**
 * Content that can be represented as markdown.
 *
 * @gqlType
 */
export class Markdown {
  static fromString(content: string, contentId: number | null): Markdown {
    return new Markdown(parse(content), contentId);
  }
  constructor(
    private rawAst: Node,
    private contentId: number | null,
  ) {}

  cloneAst(): Node {
    return map(this.rawAst, (node) => ({ ...node }));
  }

  /**
   * The content encoded as a markdown string.
   * @gqlField
   */
  markdownString(): string {
    const ast = this.cloneAst();
    visit(ast, (node, index, parent) => {
      if (node.type === "image") {
        // @ts-ignore
        node.url = node.imageProps?.cachedPath ?? node.url;
      }
    });

    // @ts-ignore
    return toMarkdown(ast, SERIALIZE_MARKDOWN_OPTIONS);
  }

  async ast(): Promise<Node> {
    const ast = this.cloneAst();
    // No idea why I can't use this via unified().use(remarkInlineLinks)
    const transform = remarkInlineLinks();
    // @ts-ignore
    transform(ast);
    fixHtml(ast);

    await syntaxHighlighting(ast);
    return ast;
  }

  /** @gqlField */
  links(): Array<Link> {
    if (this.contentId == null) {
      return [];
    }
    const links = db
      .prepare<[{ contentId: number }], { link_url: string }>(sql`
        SELECT
          link_url
        FROM
          content_links
        WHERE
          content_id = :contentId
      `)
      .all({ contentId: this.contentId });
    return links.map((row) => new Link(row.link_url));
  }

  /** @gqlField */
  images(): Array<Image> {
    if (this.contentId == null) {
      return [];
    }
    const images = db
      .prepare<[{ contentId: number }], { image_url: string }>(sql`
        SELECT
          image_url
        FROM
          content_images
        WHERE
          content_id = :contentId
      `)
      .all({ contentId: this.contentId });
    return images.map((row) => new Image(row.image_url));
  }

  /** @gqlField */
  audioFiles(): Array<AudioFile> {
    if (this.contentId == null) {
      return [];
    }
    const audioFiles = db
      .prepare<[{ contentId: number }], { audio_url: string }>(sql`
        SELECT
          audio_url
        FROM
          content_audio
        WHERE
          content_id = :contentId
      `)
      .all({ contentId: this.contentId });
    return audioFiles.map((row) => new AudioFile(row.audio_url));
  }

  /** @gqlField */
  tweets(): Array<Tweet> {
    if (this.contentId == null) {
      return [];
    }
    const tweets = db
      .prepare<[{ contentId: number }], { tweet_status: string }>(sql`
        SELECT
          tweet_status
        FROM
          content_tweets
        WHERE
          content_id = :contentId
      `)
      .all({ contentId: this.contentId });
    return tweets.map((row) => new Tweet(row.tweet_status));
  }

  /** @gqlField */
  youtubeVideos(): Array<YoutubeVideo> {
    if (this.contentId == null) {
      return [];
    }
    const youtubeVideos = db
      .prepare<[{ contentId: number }], { youtube_token: string }>(sql`
        SELECT
          youtube_token
        FROM
          content_youtube
        WHERE
          content_id = :contentId
      `)
      .all({ contentId: this.contentId });
    return youtubeVideos.map((row) => new YoutubeVideo(row.youtube_token));
  }
}

const SERIALIZE_MARKDOWN_OPTIONS: Options = {
  bullet: "-",
  emphasis: "_",
  rule: "-",
  handlers: {
    delete(node) {
      return `~~${node.children.map((child) => child.value).join("")}~~`;
    },
    // @ts-ignore
    textDirective(node) {
      return `:${node.name}`;
    },
    leafDirective(node) {
      // Just a small subset of the real syntax, but fine for now.
      // https://talk.commonmark.org/t/generic-directives-plugins-syntax/444
      const attributes = Object.entries(node.attributes)
        .map(([name, value]) => {
          return `${name}=${value}`;
        })
        .join(" ");
      return `::${node.name}{${attributes}}`;
    },
  },
};
