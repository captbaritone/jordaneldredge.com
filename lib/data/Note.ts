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
  METADATA_DATABASE_ID,
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

  // The Feed ID uses the notionID instead of the slug because the slug can
  // change, or at least get added later.
  feedId(): string {
    const url = new SiteUrl(`/notes/${this.notionId()}`);
    return url.fullyQualified();
  }

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
      notion_id: string;
    } = {
      title: this.title(),
      tags: this.tagSet().tagNames(),
      summary: this.summary(),
      notion_id: this.notionId(),
    };
    const summaryImage = await this.summaryImage();

    if (summaryImage) {
      metadata.summary_image = summaryImage;
    }
    const yamlMetadata = yaml.dump(metadata);
    const markdown = `---\n${yamlMetadata}---\n${await contentMarkdown.markdownString()}`;
    return markdown;
  }

  serializedFilename(forceNotionId: boolean = false): string {
    const date = new Date(this.date()).toISOString().substring(0, 10);
    const slug = forceNotionId ? this.notionId() : this.slug();
    return `${date}-${slug}.md`;
  }

  showInLists(): boolean {
    // For now we show all notes in the list.
    // In the future we may want to add an "archive" column to the metadata
    // database.

    return true;
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

export async function getAllNotes(): Promise<Note[]> {
  const metadata = await getMetadata();

  const rows: PageObjectResponse[] = metadata.rowPosts;

  const rowNotes = rows
    .filter((block) => {
      const properties: any = block.properties;
      const status = properties.Status.select?.name;
      return status === "Published" || status === "Archived";
    })
    .map((page) => {
      const properties: any = page.properties;
      const tags = properties.Tags.multi_select.map((select) => {
        return select.name;
      });
      const slug = expectSlug(page);
      const summary = expectSummary(page);
      const date = expectPublishedDate(page);
      const title = expectTitle(page, slug);
      return new Note(page.id, slug, tags, title, summary, date);
    });

  rowNotes.sort((a, b) => {
    return a.date() > b.date() ? -1 : 1;
  });
  return rowNotes;
}

export async function getNoteBySlug(slug: string): Promise<Note> {
  const { slugToId } = await getMetadata();

  const id = slugToId[slug] ?? slug;
  const page = await retrievePage(id);
  if (
    page.parent.type !== "database_id" ||
    page.parent.database_id !== METADATA_DATABASE_ID
  ) {
    throw new Error("Invalid page ID.");
  }

  const title = expectTitle(page, slug);
  const summary = expectSummary(page);
  const tags = expectTags(page);
  return new Note(page.id, slug, tags, title, summary, page.created_time);
}

function expectTitle(page: PageObjectResponse, slug: string): string {
  const properties: any = page.properties;
  const texts = properties.Note.title.map((block) => {
    if (block.type !== "text") {
      throw new Error(`Expected a text block for ${slug}.`);
    }
    return block.text.content;
  });

  return texts.join("");
}

function expectPublishedDate(page: PageObjectResponse): string {
  const properties: any = page.properties;
  const publishedDate = properties["Published Date"].date;
  return publishedDate != null ? publishedDate.start : page.created_time;
}

function expectSlug(page: PageObjectResponse): string {
  // @ts-ignore
  const slugRichText = page.properties.Slug.rich_text[0];
  return slugRichText ? slugRichText.text.content : page.id;
}

function expectSummary(page: PageObjectResponse): string {
  const properties: any = page.properties;
  return properties.Summary.rich_text[0]?.text.content;
}

function expectTags(page: PageObjectResponse): string[] {
  const properties: any = page.properties;
  return properties.Tags.multi_select.map((select) => {
    return select.name;
  });
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
            fetch(node.url, { cache: "no-store" })
              .then(async ({ body, ok }) => {
                if (!ok) {
                  console.error("Failed to fetch image", node.url);
                  return;
                }
                // Save file to destination
                const dest = fs.createWriteStream(destination);
                await finished(Readable.fromWeb(body).pipe(dest));
              })
              .catch((e) => {
                console.error("Failed to fetch image", node.url, e);
              })
          );
        }
      }
    }
  });
  await Promise.all(promises);
}
