import path from "node:path";
import fs from "node:fs";
import { Markdown } from "./Markdown";
import { Indexable, Linkable, Listable } from "./interfaces.js";
import yaml from "js-yaml";
import { SiteUrl } from "./SiteUrl";
import { Query } from "./GraphQLRoots";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import {
  blocksToMarkdownAst,
  getMetadata,
  retrieveBlocks,
  retrievePage,
} from "../services/notion";
import { TagSet } from "./TagSet";
import { Node } from "unist";
import { visit } from "unist-util-visit";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";

/**
 * A less formal post. Usually a quite observation, shared link or anecdote.
 * @gqlType
 */
export class Note implements Indexable, Linkable, Listable {
  pageType = "note" as const;
  constructor(
    private id: string,
    private _slug: string,
    private _tags: string[],
    private _title: string,
    private _summary: string | undefined,
    private _date: string
  ) {}

  notionId(): string {
    return this.id;
  }

  /** @gqlField */
  url(): SiteUrl {
    return new SiteUrl(`/notes/${this.slug()}`);
  }

  /** @gqlField */
  tagSet(): TagSet {
    return TagSet.fromTagStrings(this._tags);
  }

  /** A unique name for the Note. Used in the URL and for refetching. */
  slug(): string {
    return this._slug;
  }

  /** @gqlField */
  title(): string {
    return this._title;
  }

  /** @gqlField */
  date(): string {
    return this._date;
  }

  /** @gqlField */
  summary(): string | undefined {
    return this._summary;
  }

  /** @gqlField */
  async summaryImage(): Promise<string | undefined> {
    const markdown = await this.content();
    const markdownAst = await markdown.ast();
    let summaryImage: string | undefined = undefined;
    visit(markdownAst, (node, index, parent) => {
      if (summaryImage != null) {
        return false;
      }
      if (node.type === "image" && node.imageProps?.cachedPath) {
        summaryImage = node.imageProps.cachedPath;
      }
    });

    return summaryImage;
  }

  async rawMarkdownAst(): Promise<Node> {
    const pageBlocks = await retrieveBlocks(this.id);
    return await blocksToMarkdownAst(pageBlocks.results);
  }

  /** @gqlField */
  async content(): Promise<Markdown> {
    const ast = await this.rawMarkdownAst();
    await downloadImages(ast);
    return new Markdown(ast);
  }

  async contentWithHeader(): Promise<string> {
    const contentMarkdown = await this.content();

    const metadata: {
      title: string;
      tags: string[];
      summary: string | undefined;
      summary_image?: string;
    } = {
      title: this.title(),
      tags: this.tagSet().tagNames(),
      summary: this.summary(),
    };
    const summaryImage = await this.summaryImage();

    if (summaryImage) {
      metadata.summary_image = summaryImage;
    }
    const yamlMetadata = yaml.dump(metadata);
    const markdown = `---\n${yamlMetadata}---\n${await contentMarkdown.markdownString()}`;
    return markdown;
  }

  serializedFilename(): string {
    const date = new Date(this.date()).toISOString().substring(0, 10);
    return `${date}-${this.slug()}.md`;
  }

  /** @gqlField */
  static async getNoteBySlug(_: Query, args: { slug: string }): Promise<Note> {
    return getNoteBySlug(args.slug);
  }

  /** @gqlField  */
  static async getAllNotes(_: Query): Promise<Note[]> {
    return getAllNotes();
  }
}

const TIL_INDEX_PAGE_ID = "4817435c-8e47-4d3c-858f-6f5949339ffe";

export async function getAllNotes(): Promise<Note[]> {
  const [_children, metadata] = await Promise.all([
    retrieveBlocks(TIL_INDEX_PAGE_ID),
    getMetadata(),
  ]);

  const children = _children as any;

  return children.results
    .filter((block) => block.type === "child_page")
    .sort((a, b) => {
      return a.created_time > b.created_time ? -1 : 1;
    })
    .map((page) => {
      const slug = metadata.idToSlug[page.id] || page.id;
      const tags = metadata.idToTags[page.id] || [];
      const summary = metadata.idToSummary[page.id];
      return new Note(
        page.id,
        slug,
        tags,
        page.child_page.title,
        summary,
        // TODO: This might be the metadata's created time
        page.created_time
      );
    });
}

export async function getNoteBySlug(slug: string): Promise<Note> {
  const { slugToId, idToTags, idToSummary } = await getMetadata();

  const id = slugToId[slug] ?? slug;
  const page = await retrievePage(id);
  if (
    page.parent.type !== "page_id" ||
    page.parent.page_id !== TIL_INDEX_PAGE_ID
  ) {
    throw new Error("Invalid page ID.");
  }

  const title = expectTitle(page, slug);

  const summary = idToSummary[id];
  const tags = idToTags[id];
  return new Note(id, slug, tags, title, summary, page.created_time);
}

function expectTitle(page: PageObjectResponse, slug: string): string {
  const titleObj = page.properties.title;
  if (titleObj.type !== "title") {
    throw new Error(`Invalid title object for ${slug}.`);
  }

  const texts = titleObj.title.map((block) => {
    if (block.type !== "text") {
      throw new Error(`Expected a text block for ${slug}.`);
    }
    return block.text.content;
  });

  return texts.join(" ");
}

async function downloadImages(tree): Promise<void> {
  const promises: Promise<unknown>[] = [];
  visit(tree, (node, index, parent) => {
    if (node.type === "image") {
      const url = new URL(node.url);
      if (url.hostname.endsWith("amazonaws.com")) {
        const pathname = url.pathname;
        const destination = path.join(
          process.cwd(),
          "public",
          "notion-mirror",
          pathname
        );

        // If the file already exists:
        if (!fs.existsSync(destination)) {
          // ensure the directory exists
          fs.mkdirSync(path.dirname(destination), { recursive: true });
          promises.push(
            fetch(node.url, { cache: "no-store" }).then(
              async ({ body, ok }) => {
                if (!ok) {
                  console.log("Failed to fetch image", node.url);
                  return;
                }
                // Save file to destination
                const dest = fs.createWriteStream(destination);
                await finished(Readable.fromWeb(body).pipe(dest));
              }
            )
          );
        }
      }
    }
  });
  await Promise.all(promises);
}
