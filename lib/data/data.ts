import fs from "fs";
import { join } from "path";

export { getAllPages, getPageBySlug, Page } from "./Page";
export { getAllPosts, getPostBySlug, Post } from "./Post";
export { getAllNotes, getNoteBySlug, Note } from "./Note";
export type { Indexable } from "./interfaces";

type ResumeEntry = {
  id: string;
  character: string;
  title: string;
  start_date: string;
  end_date: string;
  tickets_url: string | undefined;
  sung_in_translation: boolean;
  company: string;
};

export function getSingerResume(): ResumeEntry[] {
  const resumePath = join(process.cwd(), "./performances.json");
  const fileContents = fs.readFileSync(resumePath, "utf8");
  return JSON.parse(fileContents);
}
