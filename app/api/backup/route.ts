import path from "node:path";
import fs from "node:fs";
import * as Data from "../../../lib/data";
import { visit } from "unist-util-visit";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // We don't want regular users to be able to trigger a backup
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }
  const notes = await Data.getAllNotes();
  for (const note of notes) {
    const ast = await note.rawMarkdownAst();
    await downloadImages(ast);

    const contentWithHeader = await note.contentWithHeader();
    const fileName = note.serializedFilename();
    const filePath = path.join(process.cwd(), "_notes", fileName);

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, contentWithHeader);
  }
  return new Response("Backup complete");
}

async function downloadImages(tree): Promise<void> {
  const promises: Promise<unknown>[] = [];
  visit(tree, (node, index, parent) => {
    if (node.type === "image") {
      const url = new URL(node.url);
      if (url.hostname.endsWith("amazonaws.com")) {
        const pathname = url.pathname;
        const destination = path.join(
          process.cwd(),
          "public",
          "notion-mirror",
          pathname
        );

        // If the file already exists:
        if (!fs.existsSync(destination)) {
          // ensure the directory exists
          fs.mkdirSync(path.dirname(destination), { recursive: true });
          promises.push(
            fetch(node.url, { cache: "no-store" }).then(
              async ({ body, ok }) => {
                if (!ok) {
                  console.log("Failed to fetch image", node.url);
                  return;
                }
                // Save file to destination
                const dest = fs.createWriteStream(destination);
                await finished(Readable.fromWeb(body).pipe(dest));
              }
            )
          );
        } else {
          console.log("Image already exists", destination);
        }
      }
    }
  });
  await Promise.all(promises);
}
