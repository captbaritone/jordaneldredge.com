import "dotenv/config";
import * as Search from "../lib/search";

main();

async function main() {
  const force = process.argv.includes("--force");
  await Search.reindex({ force });
}
