/**
 * This module exposes all data accessors and classes to the rest of the app.
 */

import Content from "./Content";
import ContentConnection from "./ContentConnection";

export { getAllPages, getPageBySlug, Page } from "./Page";
export { getSingerResume } from "./SingerResume";
export type { ResumeEntry } from "./SingerResume";
export { Content };
export { ContentConnection };
