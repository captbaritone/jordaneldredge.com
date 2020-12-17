import Head from "next/head";
import Link from "next/link";

export default function Layout({ children, title }) {
  return (
    <>
      <Head>
        <title>{(title ? `${title} / ` : "") + "Jordan Eldredge"}</title>
        <link
          href="https://unpkg.com/prismjs@0.0.1/themes/prism-tomorrow.css"
          rel="stylesheet"
        />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </Head>
      <div className="max-w-2xl mx-auto p-5">
        <nav className="flex justify-between flex-col sm:flex-row pb-5">
          <div>
            <Link href="/">Jordan Eldredge</Link>
          </div>
          <ul className="flex">
            <li className="pr-5">
              <Link href="/">About</Link>
            </li>
            <li className="pr-5">
              <Link href="/blog/">Blog</Link>
            </li>
            <li className="pr-5">
              <Link href="/singer/">Singer</Link>
            </li>
            <li className="pr-5">
              <Link href="/contact/">Contact</Link>
            </li>
            <li>
              <Link href="/projects/">Projects</Link>
            </li>
          </ul>
        </nav>
        <main>{children}</main>
      </div>
      <footer></footer>
    </>
  );
}
