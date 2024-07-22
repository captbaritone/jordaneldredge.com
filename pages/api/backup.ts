import path from "node:path";
import fs from "node:fs";
import * as Data from "../../lib/data";

export default async function backup(req, res) {
  // We don't want regular users to be able to trigger a backup
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).send("Forbidden");
  }
  const notes = await Data.getAllNotes();
  for (const note of notes) {
    const content = await note.contentWithHeader();
    // YYYY-MM-DD
    const dateString = new Date(note.date()).toISOString().slice(0, 10);
    const fileName = `${dateString}-${note.slug()}.md`;
    const filePath = path.join(process.cwd(), "_notes", fileName);

    fs.writeFileSync(filePath, content.markdownString());
  }
  return res.status(200).send("Backup complete");
}
