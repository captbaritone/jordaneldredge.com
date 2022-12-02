const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const api = require("../lib/api");

// this is a top-level await
(async () => {
  // open the database
  const db = await open({
    filename: "/tmp/database.db",
    driver: sqlite3.Database,
  });

  const posts = api.getAllPosts([
    "title",
    "date",
    "slug",
    "author",
    "coverImage",
  ]);
  console.log(posts);
})();
