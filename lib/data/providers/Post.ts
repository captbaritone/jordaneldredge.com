import fs from "fs";
import { join, basename } from "path";
import matter from "gray-matter";
import yaml from "js-yaml";
import { SiteUrl } from "../SiteUrl";
import {
  IndexableConcrete,
  IndexableProvider,
  IndexableStub,
} from "../Indexable";
import { ensureYoutubeImage, keyForYoutubeThumbnail } from "./providerUtils";
import { keyUrl } from "../../s3";

const postsDirectory = join(process.cwd(), "./_posts");

const FILE_NAME_PARSER = /^(\d{4}-\d{2}-\d{2})-([a-z0-9\_\.\-]+)\.md$/g;

/**
 * Reads blog posts from the _posts directory. Each post is a markdown file with
 * a specific filename format and a YAML frontmatter block.
 */
export class PostProvider implements IndexableProvider {
  _posts: IndexableConcrete[];
  async enumerate(): Promise<IndexableStub[]> {
    return fs.readdirSync(postsDirectory).map((fileName) => {
      const matches = Array.from(fileName.matchAll(FILE_NAME_PARSER))[0];
      if (matches == null) {
        throw new Error(`Incorrect filename for post. Got "${fileName}".`);
      }
      const [_, __, slug] = matches;
      const fullPath = join(postsDirectory, `${fileName}`);
      // Get last updated timestamp from file system
      const stats = fs.statSync(fullPath);
      const lastModified = stats.mtimeMs;
      return { pageType: "post", slug, lastModified, id: fullPath };
    });
  }

  async resolve(stub: IndexableStub): Promise<IndexableConcrete> {
    const fullPath = stub.id;
    const fileName = basename(fullPath);
    const matches = Array.from(fileName.matchAll(FILE_NAME_PARSER))[0];
    if (matches == null) {
      throw new Error(`Incorrect filename for post. Got "${fileName}".`);
    }
    const [_, date, slug] = matches;
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data: metadata, content } = matter(fileContents, {
      // @ts-ignore
      engines: { yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) },
    });

    if (metadata.youtube_slug != null) {
      await ensureYoutubeImage(metadata.youtube_slug);
    }

    let summaryImage = metadata.summary_image;
    if (summaryImage == null && metadata.youtube_slug != null) {
      summaryImage = keyUrl(keyForYoutubeThumbnail(metadata.youtube_slug));
    }
    return {
      pageType: "post",
      content,
      title: metadata.title,
      summary: metadata.summary,
      tags: metadata.tags,
      slug: slug,
      date: date,
      summaryImage,
      feedId: new SiteUrl(`/blog/${slug}`).fullyQualified(),
      lastModified: stub.lastModified,
      metadata,
    };
  }
}
