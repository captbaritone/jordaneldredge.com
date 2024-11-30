import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import * as Data from "../lib/data";

main();

async function main() {
  console.log("Looking for notes to backup");
  // We don't want regular users to be able to trigger a backup
  const notes = await Data.getAllNotesFromNotion();
  console.log(`Found ${notes.length} notes to backup`);
  for (const note of notes) {
    const fileName = note.serializedFilename();
    // Check if the note has been updated since last backup
    const lastModified = note.lastModified();
    const filePath = joinNotesPath(fileName);
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.mtimeMs >= lastModified) {
        console.log("Skipping note", fileName);
        continue;
      }
    }
    console.log("Backing up note", fileName);
    const contentWithHeader = await note.contentWithHeader();
    const notionIdFileName = note.serializedFilename(true);

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
