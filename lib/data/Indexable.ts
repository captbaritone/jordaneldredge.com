"use server";
import { updateRank } from "./Ranking";
import { db, sql } from "../db";

import { NoteProvider } from "./providers/Note";
import { PostProvider } from "./providers/Post";
import { Markdown } from "./Markdown";
import { AudioFile } from "./AudioFile";
import { YoutubeVideo } from "./YoutubeVideo";
import { Tweet } from "./Tweet";
import { visit } from "unist-util-visit";
import { Node } from "unist";

export type IndexableStub = {
  pageType: PageType;
  slug: string;
  lastModified: number;
  id: string;
};

/**
 * Models a source of content where the list of content can be enumerated
 * relatively quickly, and then each piece of content can be resolved into a
 * full Indexable object if the content has changed since it was last indexed.
 */
export interface IndexableProvider {
  /**
   * Enumerate all the content that this provider can provide.
   */
  enumerate(): Promise<IndexableStub[]>;
  /**
   * Resolve a specific piece of content into a full Indexable object. Generally
   * this will involve reading the content from disk or an external API, and
   * thus can/should be avoided if the content has not changed.
   */
  resolve(stub: IndexableStub): Promise<IndexableConcrete>;
}

export type PageType = "post" | "page" | "note";

export type IndexableConcrete = {
  pageType: PageType;
  content: string;
  title: string;
  summary?: string;
  tags: string[];
  slug: string;
  date: string;
  summaryImage?: string;
  feedId: string;
  lastModified: number;
  metadata: Object;
};

export async function reindex({
  force = false,
  filter = null,
}: {
  force?: boolean;
  filter: string | null;
}) {
  console.log("REINDEX", { force });
  const providers = [new NoteProvider(), new PostProvider()];
  const stubIDs = new Set<string>();
  for (const provider of providers) {
    for (const stub of await provider.enumerate()) {
      stubIDs.add(getStubId(stub.pageType, stub.slug));
      if (filter && !stub.slug.includes(filter)) {
        continue;
      }
      const row = GET_LAST_UPDATED_PAGE_AND_SLUG.get(stub);
      if (!force && row != null && row.last_updated >= stub.lastModified) {
        console.log("Skipping indexing", stub.slug);
        continue;
      }
      console.log("INDEXING", stub.slug);
      const indexable = await provider.resolve(stub);

      const markdown = Markdown.fromString(indexable.content, null);
      const extracted = extract(markdown.cloneAst());

      const indexTransaction = db.transaction(() => {
        UPSERT_INDEX.run({
          pageType: indexable.pageType,
          title: indexable.title,
          summary: indexable.summary || "",
          tags: indexable.tags.join(" "),
          content: indexable.content,
          slug: indexable.slug,
          date: indexable.date,
          summaryImagePath: indexable.summaryImage,
          feedId: indexable.feedId,
          lastUpdated: Date.now(),
          metadata: JSON.stringify(stripStructuredMetadata(indexable.metadata)),
        });

        const contentId = GET_CONTENT_ID.get({
          pageType: indexable.pageType,
          slug: indexable.slug,
        })?.id;
        if (!contentId) {
          throw new Error(`Failed to get content ID for ${indexable.slug}`);
        }

        DELETE_IMAGES_FOR_CONTENT.run({ contentId });
        DELETE_AUDIO_FOR_CONTENT.run({ contentId });
        DELETE_LINKS_FOR_CONTENT.run({ contentId });
        DELETE_YOUTUBE_FOR_CONTENT.run({ contentId });
        DELETE_TWEETS_FOR_CONTENT.run({ contentId });

        for (const image of extracted.images) {
          ADD_CONTENT_IMAGE.run({
            contentId,
            imageUrl: image,
          });
        }

        for (const link of extracted.links) {
          ADD_CONTENT_LINK.run({
            contentId,
            linkUrl: link,
          });
        }
        for (const youtube of extracted.youtubeVideos) {
          ADD_CONTENT_YOUTUBE.run({
            contentId,
            youtubeToken: youtube.token,
          });
        }
        for (const audio of extracted.audioFiles) {
          ADD_CONTENT_AUDIO.run({
            contentId,
            audioUrl: audio.src,
          });
        }
        for (const tweet of extracted.tweets) {
          ADD_CONTENT_TWEET.run({
            contentId,
            tweetStatus: tweet.statusId,
          });
        }
      });

      retryBusy(() => indexTransaction());
    }
  }
  // Check for indexed entries that no longer exist, and clean them up
  for (const entry of ALL_SEARCH_ENTRIES.all()) {
    const stubID = getStubId(entry.page_type, entry.slug);
    if (!stubIDs.has(stubID)) {
      console.log("SCRUB", stubID);
      DELETE_ENTRY.run({ slug: entry.slug, pageType: entry.page_type });
    }
  }

  // Recompute the rank of all pages
  updateRank();
}

function getStubId(pageType: string, slug: string): string {
  return `${pageType}:${slug}`;
}

function stripStructuredMetadata(metadata: {
  title?: string;
  summary?: string;
  summary_image?: string;
  tags?: string;
}): Object {
  const copy = { ...metadata };
  delete copy.title;
  delete copy.summary_image;
  delete copy.summary;
  delete copy.tags;
  return copy;
}

function retryBusy(fn: () => void, retries = 10, delayMs = 100): void {
  while (true) {
    try {
      return fn();
    } catch (err: any) {
      if (err.code !== "SQLITE_BUSY" || retries-- <= 0) throw err;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delayMs);
    }
  }
}

const ALL_SEARCH_ENTRIES = db.prepare<[], { page_type: string; slug: string }>(
  sql`
    SELECT
      slug,
      page_type
    FROM
      content;
  `,
);

const DELETE_ENTRY = db.prepare<{ slug: string; pageType: string }, void>(sql`
  DELETE FROM content
  WHERE
    slug = :slug
    AND page_type = :pageType;
`);

const GET_LAST_UPDATED_PAGE_AND_SLUG = db.prepare<
  { pageType: string; slug: string },
  { last_updated: number }
>(sql`
  SELECT
    last_updated
  FROM
    content
  WHERE
    page_type = :pageType
    AND slug = :slug
`);

const GET_CONTENT_ID = db.prepare<
  { pageType: string; slug: string },
  { id: number }
>(sql`
  SELECT
    id
  FROM
    content
  WHERE
    page_type = :pageType
    AND slug = :slug
`);

const ADD_CONTENT_IMAGE = db.prepare<{
  contentId: number;
  imageUrl: string;
}>(sql`
  INSERT INTO
    content_images (content_id, image_url)
  VALUES
    (:contentId, :imageUrl)
`);

const ADD_CONTENT_LINK = db.prepare<{
  contentId: number;
  linkUrl: string;
}>(sql`
  INSERT INTO
    content_links (content_id, link_url)
  VALUES
    (:contentId, :linkUrl)
`);
const ADD_CONTENT_YOUTUBE = db.prepare<{
  contentId: number;
  youtubeToken: string;
}>(sql`
  INSERT INTO
    content_youtube (content_id, youtube_token)
  VALUES
    (:contentId, :youtubeToken)
`);
const ADD_CONTENT_AUDIO = db.prepare<{
  contentId: number;
  audioUrl: string;
}>(sql`
  INSERT INTO
    content_audio (content_id, audio_url)
  VALUES
    (:contentId, :audioUrl)
`);
const ADD_CONTENT_TWEET = db.prepare<{
  contentId: number;
  tweetStatus: string;
}>(sql`
  INSERT INTO
    content_tweets (content_id, tweet_status)
  VALUES
    (:contentId, :tweetStatus)
`);

const DELETE_IMAGES_FOR_CONTENT = db.prepare<{ contentId: number }, void>(sql`
  DELETE FROM content_images
  WHERE
    content_id = :contentId
`);

const DELETE_LINKS_FOR_CONTENT = db.prepare<{ contentId: number }, void>(sql`
  DELETE FROM content_links
  WHERE
    content_id = :contentId
`);

const DELETE_YOUTUBE_FOR_CONTENT = db.prepare<{ contentId: number }, void>(sql`
  DELETE FROM content_youtube
  WHERE
    content_id = :contentId
`);
const DELETE_AUDIO_FOR_CONTENT = db.prepare<{ contentId: number }, void>(sql`
  DELETE FROM content_audio
  WHERE
    content_id = :contentId
`);
const DELETE_TWEETS_FOR_CONTENT = db.prepare<{ contentId: number }, void>(sql`
  DELETE FROM content_tweets
  WHERE
    content_id = :contentId
`);

const UPSERT_INDEX = db.prepare<{
  pageType: string;
  title: string;
  summary: string;
  tags: string;
  content: string;
  slug: string;
  date: string;
  summaryImagePath: string | undefined;
  feedId: string;
  lastUpdated: number;
  metadata: string;
}>(sql`
  INSERT INTO
    content (
      page_type,
      title,
      summary,
      tags,
      content,
      slug,
      DATE,
      summary_image_path,
      feed_id,
      last_updated,
      metadata
    )
  VALUES
    (
      :pageType,
      :title,
      :summary,
      :tags,
      :content,
      :slug,
      :date,
      :summaryImagePath,
      :feedId,
      :lastUpdated,
      :metadata
    )
  ON CONFLICT (page_type, slug) DO UPDATE
  SET
    title = :title,
    summary = :summary,
    tags = :tags,
    content = :content,
    DATE = :date,
    summary_image_path = :summaryImagePath,
    feed_id = :feedId,
    last_updated = :lastUpdated,
    metadata = :metadata
`);

type LeafDirectiveNode =
  | { name: "audio"; attributes: { src: string } }
  | { name: "tweet"; attributes: { status: string } }
  | { name: "youtube"; attributes: { token: string; vertical?: any } }
  | { name: "__unknown" };

function extract(rawAst: Node): {
  links: Array<string>;
  images: Array<string>;
  youtubeVideos: Array<YoutubeVideo>;
  audioFiles: Array<AudioFile>;
  tweets: Array<Tweet>;
} {
  const links: Array<string> = [];
  const images: Array<string> = [];
  const youtubeVideos: Array<YoutubeVideo> = [];
  const audioFiles: Array<AudioFile> = [];
  const tweets: Array<Tweet> = [];

  visit(rawAst, "link", (node: any) => {
    links.push(node.url);
  });

  visit(rawAst, "image", (node: any) => {
    images.push(node.url);
  });

  visit(rawAst, "leafDirective", (node: LeafDirectiveNode) => {
    if (node.name === "youtube") {
      youtubeVideos.push(
        new YoutubeVideo(
          node.attributes.token,
          Boolean(node.attributes.vertical),
        ),
      );
    } else if (node.name === "audio") {
      audioFiles.push(new AudioFile(node.attributes.src));
    } else if (node.name === "tweet") {
      tweets.push(new Tweet(node.attributes.status));
    }
  });
  return {
    links,
    images,
    youtubeVideos,
    audioFiles,
    tweets,
  };
}
