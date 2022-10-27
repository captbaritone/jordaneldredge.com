import "../styles/globals.css";
import "../styles/shiki-twoslash.css";

// import Head from "next/head";
import Script from "next/script";
import Link from "next/link";
import NavLink from "./NavLink";

export default function Layout({ children, title, typoLink, params }) {
  return (
    <html>
      <body>
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
        <div className="max-w-2xl mx-auto p-5">
          <nav className="flex justify-between flex-col sm:flex-row pb-5">
            <div className="font-medium">
              <Link href="/">Jordan Eldredge</Link>
            </div>
            <ul className="flex">
              <li className="pr-5">
                <NavLink href="/">About</NavLink>
              </li>
              <li className="pr-5">
                <NavLink href="/blog/">Blog</NavLink>
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
              <li>
                <NavLink href="/contact/">Contact</NavLink>
              </li>
            </ul>
          </nav>
          <main>{children}</main>
          <footer className="py-8 text-center block border-t-2 border-gray-200 border-solid">
            <a href="https://twitter.com/captbaritone">Twitter</a>
            {" • "}
            <a href="https://github.com/captbaritone">GitHub</a>
            {" • "}
            <a href="mailto:jordan@jordaneldredge.com">Email</a>
            {" • "}
            <a href="/feed/rss.xml">RSS</a>
            {typoLink != null && (
              <>
                {" • "}
                <a href={typoLink}>Fix Typo</a>
              </>
            )}
          </footer>
        </div>
      </body>
    </html>
  );
}
