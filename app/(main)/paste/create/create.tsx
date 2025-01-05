"use server";
import { db } from "../../../../lib/db";
import { getSession, userIsAdmin } from "../../../../lib/session";
import { redirect } from "next/navigation";

export async function create(formData) {
  "use server";
  const isAdmin = await userIsAdmin();
  if (!isAdmin) {
    throw new Error("You must be the admin to create a paste");
  }

  const filename = formData.get("filename");
  const content = formData.get("content");
  const session = await getSession();
  if (session.userId == null) {
    throw new Error("You must be logged in to create a paste");
  }
  INSERT_PASTE.run(session.userId, filename, content);
  const row = GET_ID.get();
  if (row == null) {
    throw new Error("Failed to create paste");
  }
  redirect(`/paste/${row.id}`);
}

const INSERT_PASTE = db.prepare<[number, string, string], void>(
  "INSERT INTO pastes (author_id, file_name, content) VALUES (?, ?, ?)",
);

const GET_ID = db.prepare<[], { id: number }>(
  "SELECT last_insert_rowid() as id",
);
