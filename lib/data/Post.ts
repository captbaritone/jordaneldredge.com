import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import yaml from "js-yaml";
import { Markdown } from "./Markdown";
import { Indexable, Linkable, Listable } from "./interfaces";
import { TagSet } from "./TagSet";
import { SiteUrl } from "./SiteUrl";
import { Query } from "./GraphQLRoots";
import { memoize, TEN_MINUTES } from "../memoize";

const postsDirectory = join(process.cwd(), "./_posts");

const FILE_NAME_PARSER = /^(\d{4}-\d{2}-\d{2})-([a-z0-9\_\.\-]+)\.md$/g;

/**
 * A formal blog post.
 * @gqlType
 */
export class Post implements Indexable, Linkable, Listable {
  pageType = "post" as const;
  constructor(
    private _content: string,
    private _metadata: any,
    private postInfo: PostInfo,
    private _lastModified: number,
  ) {}

  metadata(): Object {
    return this._metadata;
  }

  lastModified(): number {
    return this._lastModified;
  }

  feedId(): string {
    return this.url().fullyQualified();
  }

  /** @gqlField */
  content(): Markdown {
    return Markdown.fromString(this._content);
  }

  contentWithHeader(): string {
    const yamlMetadata = yaml.dump(this._metadata);
    return `---\n${yamlMetadata}---${this._content}`;
  }

  /** @gqlField */
  url(): SiteUrl {
    return new SiteUrl(`/blog/${this.slug()}`);
  }

  /** @gqlField */
  title(): string {
    return this._metadata.title;
  }
  /** A unique name for the Post. Used in the URL and for refetching. */
  slug(): string {
    return this.postInfo.slug;
  }

  /** @gqlField */
  date(): string {
    return this.postInfo.date;
  }

  /** @gqlField */
  summary(): string | undefined {
    if (!this._metadata.summary) {
      throw new Error(`No summary found for post ${this.url().path()}`);
    }
    return this._metadata.summary;
  }

  /** @gqlField */
  async summaryImage(): Promise<string | undefined> {
    if (this._metadata.summary_image) {
      return `${this._metadata.summary_image}`;
    }
    if (this._metadata.youtube_slug) {
      return `https://img.youtube.com/vi/${this._metadata.youtube_slug}/hqdefault.jpg`;
    }
    return undefined;
  }

  filename(): string {
    return this.postInfo.fileName;
  }

  /** @gqlField */
  canonicalUrl(): string | undefined {
    return this._metadata.canonical_url;
  }
  githubCommentsIssueId(): string | undefined {
    return this._metadata.github_comments_issue_id;
  }
  archive(): boolean {
    return this._metadata.archive || false;
  }
  draft(): boolean {
    return this._metadata.draft || false;
  }
  showInLists(): boolean {
    return !this.archive() && !this.draft();
  }
  /** @gqlField */
  tagSet(): TagSet {
    return TagSet.fromTagStrings(this._metadata.tags);
  }

  relatedPosts(first: number): Post[] {
    const ownTags = this.tagSet()
      .tags()
      .map((tag) => tag.name());
    const otherPosts = getAllPosts().filter(
      (post) => post.showInLists() && post.slug() !== this.slug(),
    );
    const postsWithOverlap = otherPosts
      .map((post) => {
        const otherTags = post
          .tagSet()
          .tags()
          .map((tag) => tag.name());
        const intersection = otherTags.filter((tag) =>
          ownTags.includes(tag),
        ).length;

        const union = new Set([...ownTags, ...otherTags]).size;

        return { overlap: intersection / union, post };
      })
      .filter((post) => post.overlap > 0);

    return postsWithOverlap
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, first)
      .map((post) => post.post);
  }

  /** @gqlField */
  static async getPostBySlug(_: Query, args: { slug: string }): Promise<Post> {
    return getPostBySlug(args.slug);
  }

  /** @gqlField  */
  static async getAllPosts(_: Query): Promise<Post[]> {
    return getAllPosts();
  }
}

type PostInfo = {
  fileName: string;
  slug: string;
  date: string;
};

export const getSlugPostMap = memoize(
  { ttl: TEN_MINUTES, key: "getSlugPostMap" },
  (): { [slug: string]: PostInfo } => {
    const map: { [slug: string]: PostInfo } = {};
    for (const fileName of fs.readdirSync(postsDirectory)) {
      const matches = Array.from(fileName.matchAll(FILE_NAME_PARSER))[0];
      if (matches == null) {
        throw new Error(`Incorrect filename for post. Got "${fileName}".`);
      }
      const [_, date, slug] = matches;
      map[slug] = { fileName, slug, date };
    }
    return map;
  },
);

export const getPostBySlug = memoize(
  { ttl: TEN_MINUTES, key: "getPostBySlug" },
  (slug: string): Post => {
    const postInfo = getSlugPostMap()[slug];
    if (postInfo == null) {
      throw new Error(`Could not find file for slug "${slug}".`);
    }
    const fullPath = join(postsDirectory, `${postInfo.fileName}`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents, {
      engines: {
        // @ts-ignore
        yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }),
      },
    });

    // Get last updated timestamp from file system
    const stats = fs.statSync(fullPath);
    const lastUpdated = stats.mtimeMs;

    return new Post(content, data, postInfo, lastUpdated);
  },
);

export const getAllPosts = memoize(
  { ttl: TEN_MINUTES, key: "getAllPosts" },
  (): Post[] => {
    const posts = Object.values(getSlugPostMap())
      .map(({ slug }) => getPostBySlug(slug))
      // sort posts by date in descending order
      .sort((post1, post2) => (post1.date() < post2.date() ? 1 : -1));
    return posts;
  },
);
