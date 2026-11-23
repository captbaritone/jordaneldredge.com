import path from "node:path";
import { Markdown } from "../Markdown";
import { SiteUrl } from "../SiteUrl";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import {
  blocksToMarkdownAst,
  getMetadata,
  NoteMetadata,
  retrieveBlocks,
} from "../../services/notion";
import { Node } from "unist";
import { visit } from "unist-util-visit";
import {
  IndexableConcrete,
  IndexableProvider,
  IndexableStub,
} from "../Indexable";
import { Metadata } from "../Content";
import {
  ensureYoutubeImage,
  keyForYoutubeThumbnail,
  maybeUploadImage,
} from "./providerUtils";
import { ensureVideoInfo } from "./videoInfo";
import { keyUrl } from "../../s3";
import { isVideoUrl } from "../../videoUrl";

// Regex matching Youtube URLs and extracting the token
const YOUTUBE_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;

export class NoteProvider implements IndexableProvider {
  _metadata: NoteMetadata;
  async enumerate(): Promise<IndexableStub[]> {
    const metadata = await getMetadata();
    this._metadata = metadata;

    const rows: PageObjectResponse[] = metadata.rowPosts;
    return rows
      .filter((page) => {
        const status = expectStatus(page);
        return (
          status === "Published" || status == "Archived" || status === "Draft"
        );
      })
      .map((page) => {
        const slug = expectSlug(page);
        const lastModified = new Date(page.last_edited_time).getTime();
        return {
          id: page.id,
          pageType: "note",
          slug,
          lastModified,
        };
      });
  }
  async resolve(stub: IndexableStub): Promise<IndexableConcrete> {
    const page = this._metadata.rowPosts.find((page) => page.id === stub.id);
    if (page == null) {
      throw new Error(`Could not find page with id ${stub.id}`);
    }
    const metadata: Metadata = { notion_id: page.id };
    const status = expectStatus(page);

    if (status === "Archived") {
      metadata.archive = true;
    }
    if (status === "Draft") {
      metadata.draft = true;
    }
    const pageBlocks = await retrieveBlocks(page.id);
    const ast = await blocksToMarkdownAst(pageBlocks.results);
    applyDirectives(ast);
    const markdown = new Markdown(ast, null);

    await rewriteImageUrls(ast);
    await applyVideoDirectives(ast);
    const content = markdown.markdownString();

    const slug = expectSlug(page);
    return {
      pageType: "note",
      slug,
      tags: expectTags(page),
      title: expectTitle(page, slug),
      summary: expectSummary(page),
      summaryImage: await this._summaryImage(markdown),
      date: expectPublishedDate(page),
      lastModified: new Date(page.last_edited_time).getTime(),
      // We now use a different URL structure, but we want to keep
      // these stable so we don't cause old links to be treated as new by feed
      // readers.
      feedId: new SiteUrl(`/notes/${page.id}`).fullyQualified(),
      content,
      metadata,
    };
  }

  async _summaryImage(markdown: Markdown): Promise<string | undefined> {
    let summaryImage: string | undefined = undefined;
    visit(await markdown.ast(), (node, _index, _parent) => {
      if (summaryImage != null) {
        return false;
      }
      if (node.type === "image") {
        summaryImage = node.url;
      }
      if (node.type === "leafDirective" && node.name === "youtube") {
        summaryImage = keyUrl(keyForYoutubeThumbnail(node.attributes.token));
      }
      if (node.type === "leafDirective" && node.name === "video") {
        summaryImage = node.attributes.thumbnail ?? node.attributes.poster;
      }
    });
    return summaryImage;
  }
}

type Status = "Published" | "Archived" | "Draft";

function applyDirectives(ast: Node) {
  visit(ast, "paragraph", (_node, index, parent) => {
    const node: any = _node;
    if (node.children.length === 1 && node.children[0].type === "link") {
      const linkNode = node.children[0];
      if (YOUTUBE_REGEX.test(linkNode.url)) {
        // @ts-ignore
        const [, token] = YOUTUBE_REGEX.exec(linkNode.url);

        const attributes = { token };
        if (linkNode.url.includes("shorts")) {
          attributes["vertical"] = true;
        }
        // @ts-ignore
        parent.children.splice(index, 1, {
          type: "leafDirective",
          name: "youtube",
          attributes,
        });
      }
    }
  });
}

function expectStatus(page: PageObjectResponse): Status {
  const properties: any = page.properties;
  const status = properties.Status.select?.name;
  switch (status) {
    case "Published":
    case "Archived":
    case "Draft":
      return status;
    default:
      return "Draft";
  }
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

/**
 * Replace each paragraph that is just a link to a video file with a `video`
 * directive carrying its dimensions and a poster frame. Runs after
 * `rewriteImageUrls`, so Notion uploads are read from their R2 mirror.
 *
 * If the video can't be read, the link is left alone and renders as a plain
 * video player, so one bad video doesn't fail the reindex.
 */
async function applyVideoDirectives(ast: Node): Promise<void> {
  const replacements: Array<{ parent: any; node: any; src: string }> = [];
  visit(ast, "paragraph", (_node, _index, parent) => {
    const node: any = _node;
    if (
      node.children.length === 1 &&
      node.children[0].type === "link" &&
      isVideoUrl(node.children[0].url)
    ) {
      replacements.push({ parent, node, src: node.children[0].url });
    }
  });
  await Promise.all(
    replacements.map(async ({ parent, node, src }) => {
      let info;
      try {
        info = await ensureVideoInfo(src);
      } catch (e) {
        console.warn(`Could not read video ${src}`, e);
        return;
      }
      const index = parent.children.indexOf(node);
      parent.children.splice(index, 1, {
        type: "leafDirective",
        name: "video",
        attributes: {
          src,
          poster: info.posterUrl,
          ...(info.thumbnailUrl == null
            ? {}
            : { thumbnail: info.thumbnailUrl }),
          width: String(info.width),
          height: String(info.height),
        },
      });
    }),
  );
}

function expectTags(page: PageObjectResponse): string[] {
  const properties: any = page.properties;
  return properties.Tags.multi_select.map((select) => {
    return select.name;
  });
}

async function rewriteImageUrls(tree): Promise<void> {
  const promises: Promise<unknown>[] = [];
  visit(tree, (node, _index, _parent) => {
    if (node.type === "leafDirective" && node.name === "youtube") {
      promises.push(ensureYoutubeImage(node.attributes.token));
      return;
    }
    if (node.type === "image") {
      const url = new URL(node.url);
      if (url.hostname.endsWith("amazonaws.com")) {
        const pathname = url.pathname;
        const r2_key = path.join("notion-mirror", pathname);

        // If the file already exists:
        promises.push(
          maybeUploadImage(r2_key, node.url).then(() => {
            node.url = keyUrl(r2_key);
          }),
        );
      }
    }
    // Handle video links
    if (node.type === "link") {
      const url = new URL(node.url);
      // Only migrate Notion-hosted videos (amazonaws.com)
      if (url.hostname.endsWith("amazonaws.com")) {
        if (isVideoUrl(url.pathname)) {
          const pathname = url.pathname;
          const r2_key = path.join("notion-mirror", pathname);

          promises.push(
            maybeUploadImage(r2_key, node.url).then(() => {
              node.url = keyUrl(r2_key);
            }),
          );
        }
      }
    }
  });
  await Promise.all(promises);
}
