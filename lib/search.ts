import * as Data from "./data";
import { PageType } from "./data/interfaces";
import { updateRank } from "./data/Ranking";
import { db } from "./db";

export type SearchIndexRow = {
  page_type: PageType;
  slug: string;
  title: string;
  summary: string;
  /** Space delimited list */
  tags: string;
  content: string;
  date: string;
  summary_image_path: string;
  feed_id: string;
  page_rank: number;
};

export async function reindex() {
  console.log("REINDEX");

  const posts = Data.getAllPosts();
  const notes = await Data.getAllNotes();

  const indexable: Data.Indexable[] = [...posts, ...notes];

  for (const entry of indexable) {
    if (entry.showInLists()) {
      await indexEntry(entry);
    }
  }

  scrub(posts, notes);
  updateRank();
}

const ALL_SEARCH_ENTRIES = db.prepare<[], { page_type: string; slug: string }>(
  `SELECT slug, page_type FROM search_index;`
);

const DELETE_ENTRY = db.prepare<{ slug: string; pageType: string }, void>(
  `DELETE FROM search_index WHERE slug = :slug AND page_type = :pageType;`
);

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

const SEARCH = db.prepare<{ query: string }, SearchIndexRow>(
  `
  SELECT
    search_index.slug,
    search_index.page_type,
    search_index.summary,
    search_index.tags,
    search_index.title,
    search_index.summary_image_path,
    search_index.date,
    search_index.feed_id
  FROM search_index_fts
  LEFT JOIN search_index ON search_index.rowid = search_index_fts.rowid
  WHERE search_index_fts MATCH (
    'title:' || :query || '*' || 
    ' OR content:' || :query || '*' || 
    ' OR tags:' || :query || '*' || 
    ' OR summary:' || :query || '*'
  )
  ORDER BY rank
  LIMIT 20;`
);

export function search(query: string): Array<Data.ListableSearchRow> {
  const rows = SEARCH.all({ query });
  function getItem(m: SearchIndexRow): Data.ListableSearchRow | null {
    switch (m.page_type) {
      case "post":
      case "note":
        const item = new Data.ListableSearchRow(m);
        if (!item.showInLists()) {
          return null;
        }
        return item;
      default:
        return null;
    }
  }
  return rows.map((row) => getItem(row)).filter((item) => item != null);
}

const GET_ALL_BLOG_POSTS = db.prepare<[], SearchIndexRow>(
  `
  SELECT
    search_index.slug,
    search_index.page_type,
    search_index.summary,
    search_index.tags,
    search_index.title,
    search_index.summary_image_path,
    search_index.date,
    search_index.feed_id
  FROM search_index
  WHERE search_index.page_type = 'post'
  ORDER BY date DESC;`
);

export function blogPosts(): Array<Data.ListableSearchRow> {
  const rows = GET_ALL_BLOG_POSTS.all();
  return rows.map((row) => new Data.ListableSearchRow(row));
}

const GET_ALL_NOTES = db.prepare<[], SearchIndexRow>(
  `
  SELECT
    search_index.slug,
    search_index.page_type,
    search_index.summary,
    search_index.tags,
    search_index.title,
    search_index.summary_image_path,
    search_index.date,
    search_index.feed_id
  FROM search_index
  WHERE search_index.page_type = 'note'
  ORDER BY date DESC;`
);

export function notes(): Array<Data.ListableSearchRow> {
  const rows = GET_ALL_NOTES.all();
  return rows.map((row) => new Data.ListableSearchRow(row));
}

const GET_LAST_UPDATED = db.prepare<
  { feedId: string },
  { last_updated: number }
>("SELECT last_updated FROM search_index WHERE feed_id = :feedId");

function needsReindexing(indexable: Data.Indexable) {
  const feedId = indexable.feedId();
  const row = GET_LAST_UPDATED.get({ feedId });
  if (row == null) {
    return true;
  }
  return row.last_updated < indexable.lastModified();
}

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
}>(
  `INSERT INTO search_index (
  page_type,
  title,
  summary,
  tags,
  content,
  slug,
  date,
  summary_image_path,
  feed_id,
  last_updated
) VALUES (:pageType, :title, :summary, :tags, :content, :slug, :date, :summaryImagePath, :feedId, :lastUpdated) ON CONFLICT(page_type, slug) 
 DO UPDATE SET
  title = :title,
  summary = :summary,
  tags = :tags,
  content = :content,
  date = :date,
  summary_image_path = :summaryImagePath,
  feed_id = :feedId,
  last_updated = :lastUpdated;`
);

export async function indexEntry(indexable: Data.Indexable) {
  if (!needsReindexing(indexable)) {
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
  });
}
