/**
 * This module exposes all data accessors and classes to the rest of the app.
 */

import Content from "./Content";

export { getAllPages, getPageBySlug, Page } from "./Page";
export { getAllPostsFromFileSystem, Post } from "./Post";
export { getAllNotesFromNotion, Note } from "./Note";
export { getSingerResume } from "./SingerResume";
export type { ResumeEntry } from "./SingerResume";
export { Content };
