import "dotenv/config";
import { parse } from "./markdownUtils";
import { visit } from "unist-util-visit";
import Graph from "../pageRank";
import { Database } from "sqlite";

// External links are used to seed the graph. Ideally we could find a way to
// move these to metadata in the individual posts.
const EXTERNAL_LINKS = {
  "/notes/corrupted-skins": [
    "https://news.ycombinator.com/item?id=41064645",
    "https://news.slashdot.org/story/24/07/26/0058212/bizarre-secrets-found-investigating-corrupt-winamp-skins",
    "https://www.reddit.com/r/InternetIsBeautiful/comments/1eculxu/the_bizarre_secrets_i_found_investigating_corrupt/",
    "https://lemmy.world/post/17995324",
  ],
  "/blog/interesting-bugs-caught-by-eslints-no-constant-binary-expression": [
    "https://eslint.org/blog/2022/07/interesting-bugs-caught-by-no-constant-binary-expression/",
    "https://news.ycombinator.com/item?id=38196644",
    "https://lobste.rs/s/icirwz/interesting_bugs_caught_by_eslint_s_no",
  ],
  "/blog/grats": ["https://news.ycombinator.com/item?id=39635014"],
  "/blog/speeding-up-winamps-music-visualizer-with-webassembly": [
    "https://news.ycombinator.com/item?id=26675526",
  ],
  "/notes/winamp-sqlite": ["https://news.ycombinator.com/item?id=31703874"],
};

/**
 * Uses a weighted pagerank algorithm to assign a page_rank score to each entry
 * in the search_index.
 */
export async function updateRank(db: Database) {
  const rows = await db.all(
    `
  SELECT
    content,
    tags,
    feed_id,
    page_type,
    slug
  FROM search_index`
  );

  const graph = new Graph({});
  const l = new LinkNormalizer();
  for (const row of rows) {
    if (row.page_type === "note" && row.slug) {
      l.defineCanonical(`/notes/${row.slug}`, row.feed_id);
    }
  }

  // Populate external links to seed the graph
  for (const [to, froms] of Object.entries(EXTERNAL_LINKS)) {
    for (const from of froms) {
      graph.link(from, l.assertCanonicalized(to));
    }
  }

  for (const row of rows) {
    const pageUrl = l.assertCanonicalized(row.feed_id);
    const markdownAst = parse(row.content);
    for (let link of findLinks(markdownAst, l)) {
      graph.link(pageUrl, link);
    }
    const tags = row.tags.split(" ");
    for (const tag of tags) {
      // Tags are weaker links
      graph.link(pageUrl, tag, 0.5);
      graph.link(tag, pageUrl, 0.5);
    }
  }

  // Normally this would be 0.85, but I want inbound links to have heavier weight
  // by picking a lower alpha, pagerank dissipates less
  const alpha = 0.45;
  const epsilon = 0.000001;
  const rank = graph.rank(alpha, epsilon);

  for (const row of rows) {
    const pageUrl = l.assertCanonicalized(row.feed_id);
    const pageRank =
      rank[pageUrl] == null || isNaN(rank[pageUrl]) ? 0 : rank[pageUrl];
    await db.all("UPDATE search_index SET page_rank = ? WHERE feed_id = ?", [
      pageRank,
      row.feed_id,
    ]);
  }
}

const LOCAL_PAGE_LINK = /^(https?:\/\/jordaneldredge.com)?(\/[^/])/;

/**
 * Links may be in one of a few formats:
 * - Fully qualified: https://jordaneldredge.com/notes/2022/07/24/interesting-bugs-caught-by-eslints-no-constant-binary-expression
 * - Relative: /notes/2022/07/24/interesting-bugs-caught-by-eslints-no-constant-binary-expression
 * - Relative with ID instead of slug: /notes/<id>
 *
 * In order to perform graph analysis, we need to normalize these links to a common format.
 */
class LinkNormalizer {
  cache: Record<string, string | null> = {};
  canonicalIDMap: Record<string, string> = {};

  assertCanonicalized(link: string) {
    const canonical = this.canonicalize(link);
    if (canonical == null) {
      throw new Error(`Could not normalize link: ${link}`);
    }
    return canonical;
  }

  canonicalize(link: string) {
    const normalized = this.normalizeLink(link);
    if (normalized == null) {
      return normalized;
    }

    return this.canonicalIDMap[normalized] || normalized;
  }

  defineCanonical(userFacing: string, feedId: string) {
    const normalized = this.normalizeLink(feedId);
    if (!normalized) {
      throw new Error(`Could not normalize link: ${feedId}`);
    }
    this.canonicalIDMap[userFacing] = normalized;
  }

  // Converts fully qualified and relative links to a common format: /notes/<slug>
  private normalizeLink(link: string): string | null {
    // If it's not internal, return null
    if (!LOCAL_PAGE_LINK.test(link)) {
      return null;
    }
    const sansHost = link.replace(LOCAL_PAGE_LINK, "$2");

    // Only include notes and blog posts
    if (!sansHost.startsWith("/notes/") && !sansHost.startsWith("/blog/")) {
      return null;
    }

    // Trim any trailing slashes
    return sansHost.replace(/\/$/, "");
  }
}

// Find internal links in a Markdown AST
function findLinks(ast: any, l: LinkNormalizer) {
  const links: string[] = [];
  visit(ast, (node) => {
    if (node.type === "link") {
      const url = l.canonicalize(node.url);
      if (url != null) {
        links.push(url);
      }
    }
  });
  return links;
}
