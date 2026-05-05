import { readFileSync } from "fs";

export function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk: string) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
  });
}

export async function readContent(options: {
  file?: string;
}): Promise<string | null> {
  if (options.file) {
    return readFileSync(options.file, "utf-8");
  }
  if (!process.stdin.isTTY) {
    return await readStdin();
  }
  return null;
}
