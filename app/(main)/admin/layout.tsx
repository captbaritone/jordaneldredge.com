import { userCanViewAdminUI } from "../../../lib/session";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin",
    default: "Admin Dashboard",
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const canViewAdminUI = await userCanViewAdminUI();
  if (!canViewAdminUI) {
    notFound();
  }

  return (
    <div className="markdown">
      <div className="mb-6">
        <h1>Admin Dashboard</h1>
        <nav className="flex gap-4 text-sm border-b pb-2">
          <Link href="/admin" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/admin/users" className="hover:underline">
            Users
          </Link>
          <Link href="/admin/pastes" className="hover:underline">
            Pastes
          </Link>
          {/* Add more admin links as needed */}
        </nav>
      </div>
      {children}
    </div>
  );
}
