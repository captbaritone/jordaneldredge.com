import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import ContentConnection from "../data/ContentConnection";
import Content from "../data/Content";
import { VC } from "../VC";

/**
 * Creates and configures the MCP server with tools for searching
 * and retrieving blog posts and notes.
 */
export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "jordaneldredge.com",
    version: "1.0.0",
  });

  // Create an anonymous viewer context (excludes drafts)
  const vc = VC.forBackup();

  // Tool: Search content
  server.registerTool(
    "search_content",
    {
      description:
        "Search blog posts and notes. Supports full-text search, boolean operators (AND, OR, NOT), logical grouping with parentheses, and tag search (`#tagname`). Filters: `has:image`, `has:video`, `has:audio`, `has:link`, `has:media`, `has:tweet`, `has:comments` for content features. Examples: `webamp`, `javascript AND react`, `(relay OR graphql) NOT tutorial`, `has:video #talk`.",
      inputSchema: {
        query: z.string(),
        sort: z.enum(["best", "latest"]).optional(),
        limit: z.number().optional(),
      },
    },
    async ({ query, sort = "best", limit = 10 }) => {
      const clampedLimit = Math.min(Math.max(limit, 1), 50);
      const results = ContentConnection.search(vc, query, sort, clampedLimit);

      const summaries = results.map((content) => ({
        slug: content.slug(),
        title: content.title(),
        date: content.date(),
        summary: content.summary(),
        tags: content.tagSet().tagNames(),
        url: content.url().fullyQualified(),
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(summaries, null, 2),
          },
        ],
      };
    },
  );

  // Tool: Get content by slug
  server.registerTool(
    "get_content_by_slug",
    {
      description:
        "Retrieve the full content of a blog post or note by its slug. Returns markdown with YAML frontmatter.",
      inputSchema: {
        slug: z.string(),
      },
    },
    async ({ slug }) => {
      const content = Content.getBySlug(vc, slug);

      if (!content) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No content found with slug: ${slug}`,
            },
          ],
          isError: true,
        };
      }

      // Return markdown with frontmatter using existing method
      const markdown = content.contentWithHeader();

      return {
        content: [
          {
            type: "text" as const,
            text: markdown,
          },
        ],
      };
    },
  );

  return server;
}
