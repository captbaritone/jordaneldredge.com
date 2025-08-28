"use server";
import { db } from "../../../../../lib/db";
import { getSession, userCanEditAnyPaste } from "../../../../../lib/session";
import { redirect } from "next/navigation";

export async function update(pasteId: number, formData) {
  "use server";
  const canEditPaste = await userCanEditAnyPaste();
  if (!canEditPaste) {
    throw new Error("You must have permission to edit pastes");
  }

  const filename = formData.get("filename");
  const content = formData.get("content");
  const session = await getSession();
  if (session.userId == null) {
    throw new Error("You must be logged in to edit pastes");
  }
  UPDATE_PASTE.run(content, filename, pasteId, session.userId);
  redirect(`/paste/${pasteId}`);
}

const UPDATE_PASTE = db.prepare<[string, string, number, number], void>(
  "UPDATE pastes SET content = ?, file_name = ? WHERE id = ? AND author_id = ?",
);
