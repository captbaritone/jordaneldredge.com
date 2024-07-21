import fs from "fs";
import matter from "gray-matter";
import { join } from "path";
import yaml from "js-yaml";
import { Markdown } from "./Markdown";
import { Indexable } from "./interfaces";
import { SiteUrl } from "./SiteUrl";
import { Query } from "./GraphQLRoots";
import { makeLogger } from "../logger";
import { TagSet } from "./TagSet";

const pagesDirectory = join(process.cwd(), "./_pages");

const log = makeLogger("Page");

/**
 * A static top-level content page.
 * @gqlType
 */
export class Page implements Indexable {
  pageType = "page" as const;
  constructor(
    private _slug: string,
    private _content: string,
    private metadata: any
  ) {}

  /** @gqlField */
  url(): SiteUrl {
    return new SiteUrl(this.slug());
  }

  /** @gqlField */
  content(): Markdown {
    return new Markdown(this._content);
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
  /** @gqlField */
  static async getPageBySlug(_: Query, args: { slug: string }): Promise<Page> {
    return getPageBySlug(args.slug);
  }
  /** @gqlField */
  static async getAllPages(_: Query): Promise<Page[]> {
    return getAllPages();
  }
}

export function getAllPages(): Page[] {
  log("Listing pages off disk");
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
  log("Reading page off disk", fullPath);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents, {
    engines: {
      // @ts-ignore
      yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }),
    },
  });

  return new Page(slug, content, data);
}
