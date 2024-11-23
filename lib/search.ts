import { Database } from "sqlite";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as Data from "./data";
import { PageType } from "./data/interfaces";
import { updateRank } from "./data/Ranking";

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

const filename = process.env.SEARCH_INDEX_LOCATION;

let db: Promise<Database> | undefined;

export async function getDb(): Promise<Database> {
  if (db == null) {
    if (!filename) {
      throw new Error("No SEARCH_INDEX_LOCATION set");
    }
    db = open({ filename, driver: sqlite3.Database });
  }
  return await db;
}

export async function reindex(db: Database) {
  console.log("REINDEX");

  const posts = Data.getAllPosts();
  const notes = await Data.getAllNotes();

  const indexable: Data.Indexable[] = [...posts, ...notes];

  for (const entry of indexable) {
    if (entry.showInLists()) {
      await indexEntry(db, entry);
    }
  }

  await scrub(db, posts, notes);
  await updateRank(db);
}

//
async function scrub(db: Database, posts: Data.Post[], notes: Data.Note[]) {
  const postUrls = posts
    .filter((p) => p.showInLists())
    .map((p) => p.url().path());
  const noteUrls = notes
    .filter((p) => p.showInLists())
    .map((n) => n.url().path());

  const indexableUrlPaths = new Set([...postUrls, ...noteUrls]);

  // For each current index entry, check if the slug is valid:
  const entries = await db.all(`SELECT slug, page_type FROM search_index;`);

  for (const entry of entries) {
    const topLevelDir = entry.page_type === "post" ? "blog" : "notes";
    const entryPath = `/${topLevelDir}/${entry.slug}`;
    if (!indexableUrlPaths.has(entryPath)) {
      console.log("SCRUB", entryPath);
      await db.run(
        `DELETE FROM search_index WHERE slug = ? AND page_type = ?;`,
        [entry.slug, entry.page_type]
      );
    }
  }
}

export async function search(
  query: string
): Promise<Array<Data.ListableSearchRow>> {
  const db = await getDb();
  const rows = await db.all(
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
WHERE search_index_fts MATCH ?
ORDER BY rank
LIMIT 20;`,
    [
      `title:"${query}" * OR content:"${query}" * OR tags:"${query}" * OR summary:"${query}" *`,
    ]
  );
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

export async function blogPosts(): Promise<Array<Data.ListableSearchRow>> {
  const db = await getDb();
  const rows = await db.all(
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
  return rows.map((row) => new Data.ListableSearchRow(row));
}

export async function notes(): Promise<Array<Data.ListableSearchRow>> {
  const db = await getDb();
  const rows = await db.all(
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
  return rows.map((row) => new Data.ListableSearchRow(row));
}

async function needsReindexing(db: Database, indexable: Data.Indexable) {
  const feedId = indexable.feedId();
  const row = await db.get(
    "SELECT last_updated FROM search_index WHERE feed_id = ?",
    [feedId]
  );
  if (row == null) {
    return true;
  }
  return row.last_updated < indexable.lastModified();
}

export async function indexEntry(db: Database, indexable: Data.Indexable) {
  if (!(await needsReindexing(db, indexable))) {
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
  const summaryImage = await indexable.summaryImage();
  const now = Date.now();
  await db.run(
    `
INSERT INTO search_index (
  page_type, title, summary, tags, content, slug, date, summary_image_path, feed_id, last_updated
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(page_type, slug) DO UPDATE SET title = ?, summary = ?, tags = ?, content = ?, date = ?, summary_image_path = ?, feed_id = ?, last_updated = ?;`,
    [
      indexable.pageType,
      title,
      summary,
      tags,
      content,
      indexable.slug(),
      date,
      summaryImage,
      feedId,
      now,

      // Passed a second time for
      // TODO: Use named params
      title,
      summary,
      tags,
      content,
      date,
      summaryImage,
      feedId,
      now,
    ]
  );
}
