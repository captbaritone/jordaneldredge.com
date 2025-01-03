import "../styles/globals.css";
import "../styles/shiki-twoslash.css";

// import Head from "next/head";
import { FaSearch } from "react-icons/fa";
import Script from "next/script";
import Link from "next/link";
import NavLink from "./NavLink";
import AudioPlayer from "./AudioPlayer";
import AudioContextProvider from "./AudioContext";
import HotKeys from "./HotKeys";
import { getSession } from "../lib/session";
import LogoutButton from "./LogoutButton";
import LoginButton from "./LoginButton";

export const metadata = {
  metadataBase: new URL("https://jordaneldredge.com"),
  title: {
    template: "%s / Jordan Eldredge",
  },
};

export default async function Layout({ children }) {
  const session = await getSession();
  return (
    <html>
      <body>
        <AudioContextProvider>
          <Script id="google-analytics" strategy="afterInteractive">
            {`
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
              (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
              m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
              })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
              
              ga('create', 'UA-96948-15', 'auto');
              ga('send', 'pageview')
        `}
          </Script>
          <HotKeys />
          <div className="max-w-2xl mx-auto p-5">
            <div className="flex justify-between flex-col sm:flex-row pb-2">
              <h1 className="font-medium text-base">
                <Link href="/">Jordan Eldredge</Link>
              </h1>
              <nav>
                <ul className="flex">
                  <li className="pr-5">
                    <NavLink href="/">About</NavLink>
                  </li>
                  <li className="pr-5">
                    <NavLink href="/blog/">Blog</NavLink>
                  </li>
                  <li className="pr-5">
                    <NavLink href="/notes/">Notes</NavLink>
                  </li>
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
                    <Link href={"/search"}>
                      <FaSearch title="Search" />
                    </Link>
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
              <a href="/notes/tts-podcast/">Podcast</a>
              {" • "}
              {session.userId ? <LogoutButton /> : <LoginButton />}
            </footer>
          </div>
          <AudioPlayer />
        </AudioContextProvider>
      </body>
    </html>
  );
}
