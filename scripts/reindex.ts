import "dotenv/config";
import * as Search from "../lib/search";
import { updateRank } from "../lib/data/Ranking";

main();

async function main() {
  const db = await Search.getDb();
  await Search.reindex(db);
  await updateRank(db);
}
