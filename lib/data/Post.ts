import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import yaml from "js-yaml";
import { Markdown } from "./Markdown";
import { Indexable, Linkable, Listable } from "./interfaces";
import { Tag } from "./Tag";

const postsDirectory = join(process.cwd(), "./_posts");

const FILE_NAME_PARSER = /^(\d{4}-\d{2}-\d{2})-([a-z0-9\_\.\-]+)\.md$/g;

export class Post implements Indexable, Linkable, Listable {
  pageType = "post" as const;
  constructor(
    private _content: string,
    private metadata: any,
    private postInfo: PostInfo
  ) {}

  content(): Markdown {
    return new Markdown(this._content);
  }

  url(): string {
    return `/blog/${this.slug()}`;
  }

  title(): string {
    return this.metadata.title;
  }

  slug(): string {
    return this.postInfo.slug;
  }

  date(): string {
    return this.postInfo.date;
  }

  summary(): string | undefined {
    return this.metadata.summary || null;
  }

  summaryImage(): string | undefined {
    return this.metadata.summary_image || null;
  }

  filename(): string {
    return this.postInfo.fileName;
  }
  canonicalUrl(): string | undefined {
    return this.metadata.canonical_url;
  }
  githubCommentsIssueId(): string | undefined {
    return this.metadata.github_comments_issue_id;
  }
  archive(): boolean {
    return this.metadata.archive || false;
  }
  draft(): boolean {
    return this.metadata.draft || false;
  }
  showInLists(): boolean {
    return !this.archive() && !this.draft();
  }
  tags(): Tag[] {
    return this.metadata.tags != null
      ? this.metadata.tags.map((tag) => new Tag(tag))
      : [];
  }
}

type PostInfo = {
  fileName: string;
  slug: string;
  date: string;
};

function getSlugPostMap(): { [slug: string]: PostInfo } {
  const map = {};
  for (const fileName of fs.readdirSync(postsDirectory)) {
    const matches = Array.from(fileName.matchAll(FILE_NAME_PARSER))[0];
    if (matches == null) {
      throw new Error(`Incorrect filename for post. Got "${fileName}".`);
    }
    const [_, date, slug] = matches;
    map[slug] = { fileName, slug, date };
  }
  return map;
}

export function getPostBySlug(slug: string): Post {
  const postInfo = getSlugPostMap()[slug];
  if (postInfo == null) {
    throw new Error(`Could not find file for slug "${slug}".`);
  }
  const fullPath = join(postsDirectory, `${postInfo.fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents, {
    engines: {
      yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }),
    },
  });

  return new Post(content, data, postInfo);
}

export function getAllPosts(): Post[] {
  const posts = Object.values(getSlugPostMap())
    .map(({ slug }) => getPostBySlug(slug))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date() < post2.date() ? 1 : -1));
  return posts;
}
