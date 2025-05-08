import Link from "next/link";
import NavLink from "../NavLink";
import { getSession } from "../../lib/session";
import LogoutButton from "../LogoutButton";
import LoginButton from "../LoginButton";
import SearchIcon from "./SearchIcon";
import { ALL } from "../config";

export const metadata = {
  metadataBase: new URL("https://jordaneldredge.com"),
  title: {
    template: "%s / Jordan Eldredge",
  },
};

export default async function Layout({ children }) {
  const session = await getSession();
  return (
    <div className="max-w-2xl mx-auto p-5">
      <div className="flex justify-between flex-col sm:flex-row pb-2">
        <h1 className="font-medium text-base">
          <Link href="/">Jordan Eldredge</Link>
        </h1>
        <nav>
          <ul className="flex justify-end">
            <li className="pr-5">
              <NavLink href="/">About</NavLink>
            </li>
            {ALL ? (
              <li className="pr-5">
                <NavLink href="/posts/">Posts</NavLink>
              </li>
            ) : (
              <>
                <li className="pr-5">
                  <NavLink href="/blog/">Blog</NavLink>
                </li>
                <li className="pr-5">
                  <NavLink href="/notes/">Notes</NavLink>
                </li>
              </>
            )}
            {/*
            <li className="pr-5">
              <NavLink href="/talks/">Talks</NavLink>
            </li>
*/}
            <li className="pr-5">
              <NavLink href="/projects/">Projects</NavLink>
            </li>
            {/*
            <li className="pr-5">
              <NavLink href="/singer/">Singer</NavLink>
            </li>
            */}
            <li className="pr-4">
              <NavLink href="/contact/">Contact</NavLink>
            </li>
            <li className="text-sm flex items-center pr-1">
              <SearchIcon />
            </li>
          </ul>
        </nav>
      </div>
      <main>{children}</main>
      <footer className="py-8 pb-12 text-center block border-t-2 border-gray-200 border-solid">
        <a rel="me" href="https://bsky.app/profile/capt.dev">
          Bluesky
        </a>
        {" • "}
        <a rel="me" href="https://threads.net/@captbaritone">
          Threads
        </a>
        {" • "}
        <a href="/feed/rss.xml">RSS</a>
        {" • "}
        <Link href={{ pathname: "/notes/tts-podcast/" }}>Podcast</Link>
        {" • "}
        {session.userId ? <LogoutButton /> : <LoginButton />}
        {session.userId && (
          <>
            <br />
            <a href="/paste/">Pastes</a>
            {" • "}
            <a href="/api/reindex">Reindex</a>
          </>
        )}
        <div
          className="flex justify-center p-4"
          style={{ imageRendering: "pixelated" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://capt.dev/counter/hits/20" alt="Hit Counter" />
        </div>
      </footer>
    </div>
  );
}
