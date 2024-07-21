import { Suspense } from "react";
import PageImpl from "./pageImpl";
import * as Search from "../../lib/search";
import Link from "next/link";

export async function generateMetadata({ searchParams }) {
  const title = searchParams.q ? `Search: "${searchParams.q}"` : "Search";
  return { title };
}

type ResultT = {
  url: string;
  title: string;
  page_type: string;
  summary: string;
  tags: string[];
};

export default async function SearchComponent({ searchParams }) {
  const query = searchParams.q || "";

  return (
    <div className="has-[[data-pending]]:animate-pulse">
      <PageImpl query={query} />
      <Results query={query} />
    </div>
  );
}

async function Results({ query }) {
  const db = await Search.getDb();
  // await index(db);

  const matches = await Search.search(db, query);

  function getUrl(m) {
    switch (m.page_type) {
      case "post":
        return `/blog/${m.slug}`;
      case "page":
        return `/${m.slug}`;
      case "note":
        return `/notes/${m.slug}`;
      default:
        throw new Error(`Unknown page type ${m.page_type}`);
    }
  }

  const results: ResultT[] = [];
  for (const m of matches) {
    results.push({
      url: getUrl(m),
      title: m.title,
      page_type: m.page_type,
      summary: m.summary,
      tags: m.tags.split(","),
    });
  }

  if (query === "") {
    return <ResultAlternative>Enter a search query above</ResultAlternative>;
  }
  if (results.length === 0) {
    return <ResultAlternative>No results found</ResultAlternative>;
  }
  return (
    <div>
      {results.map((post) => {
        return <ListItem key={post.url} item={post} />;
      })}
    </div>
  );
}
function ResultAlternative({ children }) {
  return <h2 className="text-center pb-4 text-gray-400">{children}</h2>;
}

function ListItem({ item }) {
  return (
    <div className="pb-6 justify-between">
      <div>
        {/*<div className="italic text-sm text-gray-400 flex">
          <DateString date={new Date(item.date())} />
        </div>*/}
        <h2 className="font-large font-semibold">
          <Link
            href={item.url}
            style={{
              wordBreak: "break-word",
              /* Adds a hyphen where the word breaks, if supported (No Blink) */
              hyphens: "auto",
            }}
          >
            {item.title}
          </Link>
        </h2>
        {item.summary ? <p>{item.summary}</p> : null}
      </div>
    </div>
  );
}
