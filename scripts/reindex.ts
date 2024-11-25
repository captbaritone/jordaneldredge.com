import "dotenv/config";
import * as Search from "../lib/search";

main();

async function main() {
  await Search.reindex();
}
