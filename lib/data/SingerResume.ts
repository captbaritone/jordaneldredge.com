import fs from "fs";
import { join } from "path";

export type SingerResume = ResumeEntry[];

export type ResumeEntry = {
  id: string;
  character: string;
  title: string;
  start_date: string;
  end_date: string;
  tickets_url: string | undefined;
  sung_in_translation: boolean;
  company: string;
};

export function getSingerResume(): SingerResume {
  const resumePath = join(process.cwd(), "./performances.json");
  const fileContents = fs.readFileSync(resumePath, "utf8");
  return JSON.parse(fileContents);
}
