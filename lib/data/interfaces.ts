import { Markdown } from "./Markdown";
import { SiteUrl } from "./SiteUrl";
import { TagSet } from "./TagSet";

type PageType = "post" | "page" | "note";

/**
 * Entries which can be indexed in our search index.
 */
export interface Indexable {
  pageType: PageType;
  content(): Promise<Markdown> | Markdown;
  title(): string;
  summary?(): string | undefined;
  tagSet(): TagSet;
  slug(): string;
}

/**
 * An entity that has a canonical URL.
 */
export interface Linkable {
  url(): SiteUrl;
}

/**
 * An entity that can be rendered in a list of items.
 * @gqlInterface
 */
export interface Listable extends Linkable {
  slug(): string;
  /** @gqlField */
  title(): string;
  /** @gqlField */
  date(): string;
  /** @gqlField */
  summary(): string | undefined;
  /** @gqlField */
  tagSet(): TagSet;
  /** @gqlField */
  summaryImage(): Promise<string | undefined>;
  showInLists(): boolean;
  /**
   * A unique ID for use in RSS feeds. This ID should be unique amongst content
   * on the site and also stable for a given pice of content.
   */
  feedId(): string;
}
