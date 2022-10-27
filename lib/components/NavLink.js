"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ href, children }) {
  const pathname = usePathname();

  const active = pathname.replace(/\/$/, "") === href.replace(/\/$/, "");

  return (
    <span className={active ? "underline" : ""}>
      <Link href={href}>{children}</Link>
    </span>
  );
}
