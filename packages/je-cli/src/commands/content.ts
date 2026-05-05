import { Command } from "commander";
import { getBaseUrl } from "../config";
import { gql, EXIT_NOT_FOUND } from "../graphql";
import { info, outputData } from "../output";

export const contentCommand = new Command("content").description(
  "Read site content (blog posts, notes)",
);

contentCommand
  .command("search <query>")
  .description("Search content (supports is:blog, is:note, #tag, has:image, etc.)")
  .option("-n, --limit <n>", "Max results", "10")
  .option("-s, --sort <sort>", "Sort by: best, latest", "best")
  .action(async (query: string, options: { limit: string; sort: string }) => {
    const base = getBaseUrl();
    const data = await gql<{
      search: Array<{
        title: string;
        slug: string;
        date: string;
        summary: string;
        url: { path: string };
        tagSet: { tags: Array<{ name: string }> };
      }>;
    }>(
      `
      query($query: String!, $sort: SortOption!, $first: Int) {
        search(query: $query, sort: $sort, first: $first) {
          title
          slug
          date
          summary
          url { path }
          tagSet { tags { name } }
        }
      }
    `,
      {
        query,
        sort: options.sort,
        first: parseInt(options.limit, 10),
      },
    );

    const results = data.search;

    outputData(results, () => {
      if (results.length === 0) {
        info("No results found.");
        return;
      }

      for (const r of results) {
        const tags = r.tagSet?.tags?.map((t) => `#${t.name}`).join(" ") || "";
        console.log(`${r.date}  ${r.title}`);
        console.log(`  ${base}${r.url.path}`);
        if (r.summary) {
          console.log(`  ${r.summary.slice(0, 100)}${r.summary.length > 100 ? "..." : ""}`);
        }
        if (tags) {
          console.log(`  ${tags}`);
        }
        console.log();
      }
    });
  });

contentCommand
  .command("get <slug>")
  .description("Get a post or note as markdown")
  .action(async (slug: string) => {
    const base = getBaseUrl();
    const res = await fetch(`${base}/${slug}.md`);
    if (!res.ok) {
      info(`Content "${slug}" not found.`);
      process.exit(EXIT_NOT_FOUND);
    }

    const content = await res.text();
    process.stdout.write(content);
  });
