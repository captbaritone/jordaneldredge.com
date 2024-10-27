import "dotenv/config";
import * as Search from "../lib/search";

main();

async function main() {
  const db = await Search.getDb();
  await Search.reindex(db);
}
