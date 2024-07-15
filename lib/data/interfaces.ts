import { Markdown } from "./Markdown";
import { SiteUrl } from "./SiteUrl";
import { Tag } from "./Tag";

type PageType = "post" | "page" | "note";

/**
 * Entries which can be indexed in our search index.
 */
export interface Indexable {
  pageType: PageType;
  content(): Promise<Markdown> | Markdown;
  title(): string;
  summary?(): string | undefined;
  tags?(): Tag[];
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
}
