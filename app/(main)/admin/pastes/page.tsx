import { Metadata } from "next";
import Link from "next/link";
import { db, prepare, sql } from "../../../../lib/db";
import { userCanViewAnyPaste } from "../../../../lib/session";
import { notFound } from "next/navigation";
import { Bytes } from "../../../../lib/components/Bytes";
import DateString, { TimeString } from "../../../../lib/components/DateString";

export const metadata: Metadata = {
  title: "All Pastes",
};

export default async function AdminPastes() {
  // Check permissions
  const canViewAnyPaste = await userCanViewAnyPaste();
  if (!canViewAnyPaste) {
    notFound();
  }

  // Get all pastes
  const pastes = await getAllPastes();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>All Pastes</h2>
      </div>

      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">File Name</th>
            <th className="px-4 py-2 text-left">Author</th>
            <th className="px-4 py-2 text-left">Created</th>
            <th className="px-4 py-2 text-left">Size</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pastes.map((paste) => (
            <tr key={paste.id} className="border-t">
              <td className="px-4 py-2">{paste.id}</td>
              <td className="px-4 py-2">
                <Link 
                  href={`/paste/${paste.id}/`}
                  className="text-blue-600 hover:underline"
                >
                  {paste.file_name || "<unnamed>"}
                </Link>
              </td>
              <td className="px-4 py-2">
                {paste.username ? (
                  <Link 
                    href={`/admin/users?search=${paste.username}`}
                    className="text-blue-600 hover:underline"
                  >
                    {paste.username}
                  </Link>
                ) : (
                  <span className="text-gray-400">User #{paste.author_id}</span>
                )}
              </td>
              <td className="px-4 py-2">
                <DateString date={new Date(paste.created_at)} />{" "}
                <TimeString date={new Date(paste.created_at)} />
              </td>
              <td className="px-4 py-2">
                <Bytes bytes={paste.size} />
              </td>
              <td className="px-4 py-2">
                <Link 
                  href={`/paste/${paste.id}/`}
                  className="text-blue-600 hover:underline mr-2"
                >
                  View
                </Link>
                <Link 
                  href={`/paste/${paste.id}/${paste.file_name || ''}`}
                  className="text-blue-600 hover:underline mr-2"
                >
                  Raw
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Query to get all pastes with user information
const GET_ALL_PASTES = prepare<
  [],
  { 
    id: number; 
    file_name: string; 
    size: number; 
    created_at: number;
    author_id: number;
    username: string;
  }
>(sql`
  SELECT
    p.id,
    p.file_name,
    octet_length(p.content) AS size,
    p.created_at,
    p.author_id,
    u.username
  FROM
    pastes p
  LEFT JOIN
    users u ON p.author_id = u.id
  ORDER BY
    p.created_at DESC
`);

// Function to get all pastes
async function getAllPastes() {
  return GET_ALL_PASTES.all();
}
