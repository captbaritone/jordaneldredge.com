import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import * as Data from "../lib/data";

main();

async function main() {
  console.log("Looking for notes to backup");
  // We don't want regular users to be able to trigger a backup
  const notes = await Data.getAllNotes();
  console.log(`Found ${notes.length} notes to backup`);
  for (const note of notes) {
    const contentWithHeader = await note.contentWithHeader();
    const fileName = note.serializedFilename();
    console.log("Backing up note", fileName);
    const notionIdFileName = note.serializedFilename(true);

    const filePath = joinNotesPath(fileName);

    // If the file not a slug assigned since last backup, delete the old file
    if (fileName !== notionIdFileName) {
      const notionIdFilePath = joinNotesPath(notionIdFileName);
      fs.rmSync(notionIdFilePath, { force: true });
    }

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, contentWithHeader);
  }
  console.log("Backup complete");
}

function joinNotesPath(fileName: string) {
  return path.join(process.cwd(), "_notes", fileName);
}
