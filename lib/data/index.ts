/**
 * This module exposes all data accessors and classes to the rest of the app.
 */

export { getAllPages, getPageBySlug, Page } from "./Page.js";
export { getAllPosts, getPostBySlug, Post } from "./Post.js";
export { getAllNotes, getNoteBySlug, Note } from "./Note.js";
export { getSingerResume } from "./SingerResume.js";
export type { ResumeEntry } from "./SingerResume.js";
export type { Indexable } from "./interfaces.js";
