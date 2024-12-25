import fs from "fs";
import matter from "gray-matter";
import { join } from "path";
import yaml from "js-yaml";
import { Markdown } from "./Markdown";
import { SiteUrl } from "./SiteUrl";
import { TagSet } from "./TagSet";

const pagesDirectory = join(process.cwd(), "./_pages");

/**
 * A static top-level content page.
 * @gqlType
 */
export class Page {
  pageType = "page" as const;
  constructor(
    private _slug: string,
    private _content: string,
    private metadata: any,
  ) {}

  /** @gqlField */
  url(): SiteUrl {
    return new SiteUrl(this.slug());
  }

  /** @gqlField */
  content(): Markdown {
    return Markdown.fromString(this._content);
  }
  /** @gqlField */
  title(): string {
    return this.metadata.title;
  }
  /** A unique name for the Page. Used in the URL and for refetching. */
  slug(): string {
    return this._slug;
  }
  /** @gqlField */
  date(): string {
    return this.metadata.date;
  }
  tagSet(): TagSet {
    return new TagSet([]);
  }
}

export function getAllPages(): Page[] {
  return fs
    .readdirSync(pagesDirectory)
    .filter((fileName) => {
      // Ensure we skip non-md and 404.md
      return /[a-z]+.md$/.test(fileName);
    })
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      if (slug == null) {
        throw new Error("No slug!");
      }
      return getPageBySlug(slug);
    });
}

export function getPageBySlug(slug: string): Page {
  const fullPath = join(pagesDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents, {
    engines: {
      // @ts-ignore
      yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }),
    },
  });

  return new Page(slug, content, data);
}
