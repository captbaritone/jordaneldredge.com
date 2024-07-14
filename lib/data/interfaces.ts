import { Markdown } from "./Markdown.js";

type PageType = "post" | "page" | "note";

/**
 * Entries which can be indexed in our search index.
 */
export interface Indexable {
  pageType: PageType;
  content(): Promise<Markdown> | Markdown;
  title(): string;
  slug(): string;
}

/**
 * An entity that has a canonical URL.
 */
export interface Linkable {
  url(): string;
}

/**
 * An entity that can be rendered in a list of items.
 */
export interface Listable extends Linkable {
  slug(): string;
  title(): string;
  date(): string;
  summary(): string | undefined;
}
