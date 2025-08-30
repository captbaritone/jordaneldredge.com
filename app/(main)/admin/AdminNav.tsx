"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();

  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    if (path === "/admin") {
      return pathname === "/admin";
    }
    return pathname?.startsWith(path);
  };

  return (
    <nav className="flex gap-4 text-sm border-b pb-2">
      <Link
        href="/admin"
        className={`font-medium hover:underline mr-4 ${
          isActive("/admin") ? "text-blue-600 font-semibold" : ""
        }`}
      >
        Dashboard
      </Link>
      <div className="h-6 border-r mr-4"></div>
      <Link
        href="/admin/users"
        className={`hover:underline ${
          isActive("/admin/users") ? "text-blue-600 font-semibold" : ""
        }`}
      >
        Users
      </Link>
      <Link
        href="/admin/pastes"
        className={`hover:underline ${
          isActive("/admin/pastes") ? "text-blue-600 font-semibold" : ""
        }`}
      >
        Pastes
      </Link>
      <Link
        href="/admin/content"
        className={`hover:underline ${
          isActive("/admin/content") ? "text-blue-600 font-semibold" : ""
        }`}
      >
        Content
      </Link>
      {/* Add more admin links as needed */}
    </nav>
  );
}
