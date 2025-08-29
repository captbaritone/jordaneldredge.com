import Link from "next/link";
import { db, prepare, sql } from "../../../lib/db";
import { User } from "../../../lib/data/User";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboard() {
  // Get some basic statistics
  const userCount = User.count();
  const contentCountResult = prepare<[], { count: number }>(sql`SELECT COUNT(*) as count FROM content`)
    .get();
  const contentCount = contentCountResult?.count || 0;

  return (
    <div>
      <h2>Site Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-lg font-bold">{userCount}</p>
          <p className="text-sm text-gray-600">Registered Users</p>
          <Link
            href="/admin/users"
            className="text-sm text-blue-600 hover:underline mt-2 inline-block"
          >
            Manage Users →
          </Link>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-lg font-bold">{contentCount}</p>
          <p className="text-sm text-gray-600">Content Items</p>
        </div>

        {/* Add more dashboard widgets as needed */}
      </div>
    </div>
  );
}
