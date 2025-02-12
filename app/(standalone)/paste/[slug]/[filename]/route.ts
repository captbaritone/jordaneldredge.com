import { notFound } from "next/navigation";
import { db, sql } from "../../../../../lib/db";
import { NextRequest } from "next/server";

export function GET(_: NextRequest, { params }) {
  const row = GET_PASTE.get({ slug: params.slug });
  if (row == null) {
    notFound();
  }

  if (row.file_name !== params.filename) {
    notFound();
  }

  return new Response(row.content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `inline; filename="${row.file_name}"`,
    },
  });
}

const GET_PASTE = db.prepare<
  { slug: string },
  { content: string; file_name: string }
>(sql`
  SELECT
    content,
    file_name
  FROM
    pastes
  WHERE
    id = :slug
`);
