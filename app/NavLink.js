"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function NavLink({ href, children }) {
  const pathname = usePathname();

  let active = false;
  if (href === "/") {
    active = pathname === "/";
  } else {
    active = pathname.startsWith(href);
  }

  return (
    <Link
      href={href}
      className={active ? "underline decoration-rule underline-offset-2" : ""}
    >
      {children}
    </Link>
  );
}
