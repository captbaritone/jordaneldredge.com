import * as Search from "../../lib/search";

export default async function search(req, res) {
  const query = req.query.q;
  // open the database
  const db = await Search.getDb();
  // await index(db);

  const matches = await Search.search(db, query);

  function getUrl(m) {
    switch (m.page_type) {
      case "post":
        return `/blog/${m.slug}`;
      case "page":
        return `/${m.slug}`;
      case "note":
        return `/notes/${m.slug}`;
      default:
        throw new Error(`Unknown page type ${m.page_type}`);
    }
  }

  const results = [];
  for (const m of matches) {
    results.push({
      url: getUrl(m),
      title: m.title,
      page_type: m.page_type,
      summary: m.summary,
      tags: m.tags.split(","),
    });
  }

  res.json(results);
}
