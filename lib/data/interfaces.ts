import { Markdown } from "./Markdown";
import { SiteUrl } from "./SiteUrl";
import { TagSet } from "./TagSet";

export type PageType = "post" | "page" | "note";

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
  date(): string;
  summaryImage(): Promise<string | undefined>;
  feedId(): string;
  lastModified(): number;
  metadata(): Object;
}

/**
 * An entity that has a canonical URL.
 */
export interface Linkable {
  url(): SiteUrl;
}
