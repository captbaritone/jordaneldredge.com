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
    <Link href={href}>
      {active ? (
        <>
          <span className="font-mono text-rule mx-0.5">/</span>
          {children}
          <span className="font-mono text-rule mx-0.5">/</span>
        </>
      ) : (
        children
      )}
    </Link>
  );
}
