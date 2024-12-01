import * as Data from "../data";
import { updateRank } from "./Ranking";
import { db, sql } from "../db";

import { Markdown } from "./Markdown";
import { TagSet } from "./TagSet";

export type PageType = "post" | "page" | "note";

/**
 * Entries which can be indexed in our search index.
 */
export interface Indexable {
  pageType: PageType;
  content(): Promise<Markdown> | Markdown;
  title(): string;
  summary?(): string | undefined;
  tagSet(): TagSet;
  slug(): string;
  date(): string;
  summaryImage(): Promise<string | undefined>;
  feedId(): string;
  lastModified(): number;
  metadata(): Object;
}

export async function reindex({
  force = false,
  predicate = (indexable: Indexable) => true,
}: {
  force?: boolean;
  predicate?: (indexable: Indexable) => boolean;
}) {
  console.log("REINDEX", { force });

  const posts: Data.Post[] = Data.getAllPostsFromFileSystem();
  const notes: Data.Note[] = await Data.getAllNotesFromNotion();

  const indexable: Indexable[] = [...posts, ...notes];

  for (const entry of indexable) {
    if (predicate(entry)) {
      await indexEntry(entry, { force });
    }
  }

  scrub(posts, notes);
  updateRank();
}

export async function indexEntry(
  indexable: Indexable,
  { force = false }: { force: boolean },
) {
  if (!needsReindexing(indexable) && !force) {
    console.log("Skipping indexing", indexable.slug());
    return;
  }
  console.log("INDEXING", indexable.slug());
  const feedId = indexable.feedId();
  const markdown = await indexable.content();
  const title = indexable.title();
  const summary = indexable.summary == null ? "" : indexable.summary() || "";
  const tags = indexable
    .tagSet()
    .tags()
    .map((t) => t.name())
    .join(" ");
  const content = await markdown.markdownString();
  const date = indexable.date();
  const summaryImagePath = await indexable.summaryImage();
  const now = Date.now();
  const metadata = stripStructuredMetadata(indexable.metadata());
  UPSERT_INDEX.run({
    pageType: indexable.pageType,
    title,
    summary,
    tags,
    content,
    slug: indexable.slug(),
    date,
    summaryImagePath,
    feedId,
    lastUpdated: now,
    metadata: JSON.stringify(metadata),
  });
}

function needsReindexing(indexable: Indexable) {
  const feedId = indexable.feedId();
  const row = GET_LAST_UPDATED.get({ feedId });
  if (row == null) {
    return true;
  }
  return row.last_updated < indexable.lastModified();
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

//
function scrub(posts: Data.Post[], notes: Data.Note[]) {
  const postUrls = posts
    .filter((p) => p.showInLists())
    .map((p) => p.url().path());
  const noteUrls = notes
    .filter((p) => p.showInLists())
    .map((n) => n.url().path());

  const indexableUrlPaths = new Set([...postUrls, ...noteUrls]);

  // For each current index entry, check if the slug is valid:
  const entries = ALL_SEARCH_ENTRIES.all();

  for (const entry of entries) {
    const topLevelDir = entry.page_type === "post" ? "blog" : "notes";
    const entryPath = `/${topLevelDir}/${entry.slug}`;
    if (!indexableUrlPaths.has(entryPath)) {
      console.log("SCRUB", entryPath);
      DELETE_ENTRY.run({ slug: entry.slug, pageType: entry.page_type });
    }
  }
}

const ALL_SEARCH_ENTRIES = db.prepare<[], { page_type: string; slug: string }>(
  sql`
    SELECT
      slug,
      page_type
    FROM
      search_index;
  `,
);

const DELETE_ENTRY = db.prepare<{ slug: string; pageType: string }, void>(sql`
  DELETE FROM search_index
  WHERE
    slug = :slug
    AND page_type = :pageType;
`);

const GET_LAST_UPDATED = db.prepare<
  { feedId: string },
  { last_updated: number }
>(sql`
  SELECT
    last_updated
  FROM
    search_index
  WHERE
    feed_id = :feedId
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
    search_index (
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
