import { SiteUrl } from "./SiteUrl";

/**
 * An entity that has a canonical URL.
 */
export interface Linkable {
  url(): SiteUrl;
}
