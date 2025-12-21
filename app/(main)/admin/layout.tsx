import { userCanViewAdminUI } from "../../../lib/session";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import AdminNav from "./AdminNav";

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
        <h1>Admin</h1>
        <AdminNav />
      </div>
      {children}
    </div>
  );
}
