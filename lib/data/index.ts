/**
 * This module exposes all data accessors and classes to the rest of the app.
 */

export { getAllPages, getPageBySlug, Page } from "./Page";
export { getAllPosts, getPostBySlug, Post } from "./Post";
export { getAllNotes, getNoteBySlug, Note } from "./Note";
export { getSingerResume } from "./SingerResume";
export type { ResumeEntry } from "./SingerResume";
export type { Indexable } from "./interfaces";
