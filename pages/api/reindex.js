import * as Search from "../../lib/search";

export default async function reindex(req, res) {
  // open the database
  const db = await Search.getDb();
  await Search.reindex(db);
  res.json({ status: "ok" });
}
