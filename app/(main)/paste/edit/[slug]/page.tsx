import { notFound } from "next/navigation";
import { getSession, userIsAdmin } from "../../../../../lib/session";
import { update } from "./update";
import { db, sql } from "../../../../../lib/db";

export default async function EditPaste({ params }) {
  const isAdmin = await userIsAdmin();
  if (!isAdmin) {
    notFound();
  }
  const session = await getSession();
  const userId = session.userId;
  if (userId == null) {
    notFound();
  }
  const paste = GET_PASTE.get({ slug: params.slug, authorId: userId });
  if (paste == null) {
    notFound();
  }

  const bound = update.bind(null, paste.id);

  return (
    <div className="markdown">
      <form className="flex flex-col py-4" action={bound}>
        <h1>Edit Paste</h1>
        <div className="flex flex-col bg-gray-100 rounded-lg border border-gray-400 pb-8">
          <input
            type="text"
            name="filename"
            required
            defaultValue={paste.file_name}
            placeholder="Filename including extension..."
            className="py-1 px-4 m-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <textarea
            name="content"
            defaultValue={paste.content}
            required
            className="h-64 p-4 border-t border-b border-gray-300 focus:outline-none"
          />
        </div>
        <input
          type="submit"
          value="Update Paste"
          className="self-end my-4 bg-green-700 active:bg-green-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        />
      </form>
    </div>
  );
}

const GET_PASTE = db.prepare<
  { slug: string; authorId: number },
  { content: string; file_name?: string; id: number }
>(sql`
  SELECT
    id,
    content,
    file_name
  FROM
    pastes
  WHERE
    id = :slug
    AND author_id = :authorId
`);
