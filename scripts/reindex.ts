import "dotenv/config";
import * as Search from "../lib/data/Indexable";

main();

async function main() {
  const force = process.argv.includes("--force");
  const filter =
    process.argv.find((arg) => arg.startsWith("--filter="))?.split("=")[1] ??
    null;
  await Search.reindex({ force, filter });
}
