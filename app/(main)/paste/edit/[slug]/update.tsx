"use server";
import { db } from "../../../../../lib/db";
import { getSession, userIsAdmin } from "../../../../../lib/session";
import { redirect } from "next/navigation";

export async function update(pasteId: number, formData) {
  "use server";
  const isAdmin = await userIsAdmin();
  if (!isAdmin) {
    throw new Error("You must be the admin to create a paste");
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
