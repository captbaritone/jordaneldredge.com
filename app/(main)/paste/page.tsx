import { notFound } from "next/navigation";
import { getSession } from "../../../lib/session";
import { sql } from "../../../lib/sql";
import { db } from "../../../lib/db";
import { Bytes } from "../../../lib/components/Bytes";
import DateString, { TimeString } from "../../../lib/components/DateString";
import Link from "next/link";

export default async function Pastes() {
  const session = await getSession();
  const userId = session.userId;
  if (userId == null) {
    // Logged in users only
    return notFound();
  }
  const pastes = PASTES_FOR_AUTHOR.all(userId);

  return (
    <div className="markdown">
      <div className="flex pt-2 gap-1 justify-between">
        <h1>Your Pastes</h1>
        <Link href={{ pathname: "/paste/create" }} className="self-center">
          Create Paste
        </Link>
      </div>
      <table className="w-full">
        <thead>
          <tr>
            <th>File Name</th>
            <th>Created</th>
            <th>Size</th>
            <th>Edit</th>
            <th>Raw</th>
          </tr>
        </thead>
        <tbody>
          {pastes.map((paste) => (
            <tr key={paste.id}>
              <td>
                <a href={`/paste/${paste.id}/`}>
                  {paste.file_name || "<unnamed>"}
                </a>
              </td>
              <td>
                <DateString date={new Date(paste.created_at)} />{" "}
                <TimeString date={new Date(paste.created_at)} />
              </td>
              <td>
                <Bytes bytes={paste.size} />
              </td>
              <td>
                <a href={`/paste/edit/${paste.id}`}>Edit</a>
              </td>
              <td>
                <a href={`/paste/${paste.id}/${paste.file_name}`}>Raw</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PASTES_FOR_AUTHOR = db.prepare<
  [number],
  { id: number; file_name: string; size: number; created_at: number }
>(sql`
  SELECT
    id,
    file_name,
    octet_length (content) AS size,
    created_at
  FROM
    pastes
  WHERE
    author_id = ?
  ORDER BY
    created_at DESC
`);
