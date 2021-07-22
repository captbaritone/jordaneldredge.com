import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
/* TODO
<meta name="description" content="{% if page.summary %}{{ page.summary }}{% else %}{{ site.description }}{% endif %}">
{% if page.categories %}<meta name="keywords" content="{{ page.categories | join: ', ' }}">{% endif %}
<link rel="canonical" href="{{ page.url | replace:'index.html','' | prepend: site.baseurl | prepend: site.url }}">

<!-- Open Graph -->
<!-- From: https://github.com/mmistakes/hpstr-jekyll-theme/blob/master/_includes/head.html -->
<meta property="og:description" content="{% if page.summary %}{{ page.summary }}{% else %}{{ site.description }}{% endif %}">
<meta property="og:url" content="{{ site.url }}{{ page.url }}">

*/

export default function Layout({ children, title }) {
  const fullTitle = (title ? `${title} / ` : "") + "Jordan Eldredge";
  return (
    <>
      <Head>
        <meta property="og:locale" content="en_US" />
        <title>{fullTitle}</title>
        <meta property="og:title" content={fullTitle} />
        <meta name="author" content="Jordan Eldredge" />
        <meta property="og:site_name" content="Jordan Eldredge" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <meta name="twitter:site" content="@captbaritone" />
        <meta name="twitter:creator" content="@captbaritone" />
      </Head>
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
        </footer>
      </div>
    </>
  );
}

function NavLink({ href, children }) {
  const router = useRouter();
  const pathname = router.asPath;

  const active = pathname.replace(/\/$/, "") === href.replace(/\/$/, "");

  return (
    <span className={active ? "underline" : ""}>
      <Link href={href}>{children}</Link>
    </span>
  );
}
