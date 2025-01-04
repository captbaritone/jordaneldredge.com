"use server";
import { updateRank } from "./Ranking";
import { db, sql } from "../db";

import { NoteProvider } from "./providers/Note";
import { PostProvider } from "./providers/Post";

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
