import fs from "fs";
import matter from "gray-matter";
import { join } from "path";
import yaml from "js-yaml";
import { Markdown } from "./Markdown";
import { Indexable } from "./interfaces.js";

const pagesDirectory = join(process.cwd(), "./_pages");

export class Page implements Indexable {
  pageType = "page" as const;
  constructor(private _content: string, private metadata: any) {}

  content(): Markdown {
    return new Markdown(this._content);
  }
  title(): string {
    return this.metadata.title;
  }
  slug(): string {
    return this.metadata.slug;
  }
  date(): string {
    return this.metadata.date;
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

  return new Page(content, data);
}
