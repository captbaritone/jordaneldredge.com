import "dotenv/config";
import * as Search from "../lib/data/Indexable";

main();

async function main() {
  const force = process.argv.includes("--force");
  await Search.reindex({
    force,
  });
}
