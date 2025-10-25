import fileContents from "../../performances.json" assert { type: "json" };

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
  return fileContents as SingerResume;
}
