import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  const content = readFileSync(
    join(process.cwd(), "app/(standalone)/llm/llm.md"),
    "utf-8",
  );
  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
