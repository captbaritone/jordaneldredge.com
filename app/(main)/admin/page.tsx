import Link from "next/link";
import { prepare, sql } from "../../../lib/db";
import { User } from "../../../lib/data/User";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboard() {
  // Get user count
  const userCount = User.count();
  
  // Get content count using prepare with type parameters
  const contentResult = prepare<[], { count: number }>(sql`
    SELECT COUNT(*) as count FROM content
  `).get();
  const contentCount = contentResult?.count || 0;

  // Get paste count using prepare with type parameters
  const pasteResult = prepare<[], { count: number }>(sql`
    SELECT COUNT(*) as count FROM pastes
  `).get();
  const pasteCount = pasteResult?.count || 0;

  return (
    <div>
      <h2 className="mb-3">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <Card
          title="Content Items"
          count={contentCount}
          label="entries"
          link="/admin/content"
        />
        <Card
          title="User Accounts"
          count={userCount}
          label="users"
          link="/admin/users"
        />
        <Card
          title="Code Pastes"
          count={pasteCount}
          label="pastes"
          link="/admin/pastes"
        />
      </div>
    </div>
  );
}

// Card component for consistent UI
function Card({
  title,
  count = 0,
  label,
  link,
}: {
  title: string;
  count?: number;
  label: string;
  link: string;
}) {
  return (
    <div className="bg-white p-3 rounded-lg shadow">
      <div className="flex justify-between items-baseline mb-1">
        <h4 className="font-medium">{title}</h4>
        <span className="text-lg font-bold">
          {typeof count === 'number' ? count.toLocaleString() : "0"}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">Total {label}</span>
        <Link
          href={link}
          className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center group"
        >
          Manage
          <span className="ml-1 group-hover:ml-1.5 transition-all">→</span>
        </Link>
      </div>
    </div>
  );
}
