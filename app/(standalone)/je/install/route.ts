import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  const content = readFileSync(
    join(process.cwd(), "packages/je-cli/install.sh"),
    "utf-8",
  );
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
