import Link from "next/link";
import { db } from "../../../lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboard() {
  // Get some basic statistics
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
    count: number;
  };
  const contentCount = db
    .prepare("SELECT COUNT(*) as count FROM content")
    .get() as { count: number };

  return (
    <div>
      <h2>Site Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-lg font-bold">{userCount.count}</p>
          <p className="text-sm text-gray-600">Registered Users</p>
          <Link
            href="/admin/users"
            className="text-sm text-blue-600 hover:underline mt-2 inline-block"
          >
            Manage Users →
          </Link>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-lg font-bold">{contentCount.count}</p>
          <p className="text-sm text-gray-600">Content Items</p>
        </div>

        {/* Add more dashboard widgets as needed */}
      </div>
    </div>
  );
}
