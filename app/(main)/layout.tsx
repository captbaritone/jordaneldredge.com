import Link from "next/link";
import NavLink from "../NavLink";
import { getSession } from "../../lib/session";
import LogoutButton from "../LogoutButton";
import LoginButton from "../LoginButton";
import SearchIcon from "./SearchIcon";
import { ALL } from "../config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://jordaneldredge.com"),
  title: {
    template: "%s / Jordan Eldredge",
    default: "Jordan Eldredge",
  },
};

export default async function Layout({ children }) {
  const session = await getSession();
  return (
    <div className="site-shell">
      <header className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 pb-2">
        <h1 className="font-display-sc text-sc uppercase font-bold tracking-tight">
          <Link href="/">Jordan Eldredge</Link>
        </h1>
        <nav>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 sm:justify-end font-serif text-nav uppercase font-medium">
            <li>
              <NavLink href="/">About</NavLink>
            </li>
            {ALL ? (
              <li>
                <NavLink href="/posts/">Posts</NavLink>
              </li>
            ) : (
              <>
                <li>
                  <NavLink href="/blog/">Blog</NavLink>
                </li>
                <li>
                  <NavLink href="/notes/">Notes</NavLink>
                </li>
              </>
            )}
            <li>
              <NavLink href="/projects/">Projects</NavLink>
            </li>
            <li>
              <NavLink href="/contact/">Contact</NavLink>
            </li>
            <li className="flex items-center">
              <SearchIcon />
            </li>
          </ul>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="mt-12 pt-2 border-t border-ink text-footer text-center">
        <Link rel="me" href="https://bsky.app/profile/capt.dev">
          Bluesky
        </Link>
        {" • "}
        <Link rel="me" href="https://threads.net/@captbaritone">
          Threads
        </Link>
        {" • "}
        <Link href="/feed/rss.xml">RSS</Link>
        {" • "}
        <Link href={{ pathname: "/notes/tts-podcast/" }}>Podcast</Link>
        {" • "}
        {session.userId ? <LogoutButton /> : <LoginButton />}
        {session.userId && (
          <>
            <br />
            <Link href="/admin/">Admin Dashboard</Link>
          </>
        )}
      </footer>
    </div>
  );
}
