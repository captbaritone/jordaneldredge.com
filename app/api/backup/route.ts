import path from "node:path";
import fs from "node:fs";
import * as Data from "../../../lib/data";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // We don't want regular users to be able to trigger a backup
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }
  const notes = await Data.getAllNotes();
  for (const note of notes) {
    const contentWithHeader = await note.contentWithHeader();
    const fileName = note.serializedFilename();
    const filePath = path.join(process.cwd(), "_notes", fileName);

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, contentWithHeader);
  }
  return new Response("Backup complete");
}
