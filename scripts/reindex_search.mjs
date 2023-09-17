import "dotenv/config";
import * as Api from "../lib/api.mjs";
import { getNotes, getNotePage } from "../app/notes/notion.mjs";
import { getDb, indexEntry } from "../lib/search.mjs";

async function main() {
  const db = await getDb();

  await reindex(db);
}

main();

export async function reindex(db) {
  console.log("REINDEX");

  const posts = await Api.getAllPosts([
    "title",
    "date",
    "slug",
    "author",
    "coverImage",
    "content",
  ]);

  for (const post of posts) {
    console.log(`Reindexing post: ${post.title}`);
    await indexEntry(db, { pageType: "post", ...post });
  }

  const pages = Api.getAllPages(["title", "slug", "content"]);

  for (const page of pages) {
    console.log(`Reindexing page: ${page.title}`);
    await indexEntry(db, { pageType: "page", ...page });
  }
  console.log("REINDEX NOTES");

  const notes = await getNotes();
  for (const note of notes) {
    const { title, markdown, created_time } = await getNotePage(note.id);
    console.log(`Reindexing note: ${title}`);
    await indexEntry(db, {
      pageType: "note",
      title,
      slug: note.id,
      content: markdown,
    });
  }
}
