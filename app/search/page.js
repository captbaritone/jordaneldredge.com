"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DateString from "../../lib/components/DateString";

export default function Search() {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let unmounted = false;
    if (query.length > 0) {
      setLoading(true);
      fetch(`/api/search?q=${query}`)
        .then((r) => r.json())
        .then((r) => {
          if (unmounted) return;
          setResults(r);
          setLoading(false);
        });
    } else {
      setResults([]);
      setLoading(false);
    }

    return () => {
      setLoading(false);
      unmounted = true;
    };
  }, [query]);

  return (
    <>
      <div className="markdown">
        <h1>Search</h1>
        <input
          placeholder="Search..."
          onChange={(e) => setQuery(e.target.value)}
          style={{ border: "1px solid grey" }}
          value={query}
        />
        {loading && "..."}
        <hr />
      </div>
      <Results results={results} />
    </>
  );
}

function Results({ results }) {
  if (results.length === 0) {
    return <h1>No results found</h1>;
  }
  return (
    <>
      {results.map((post) => {
        const date = new Date();
        return (
          <div key={post.url} className="py-4 flex justify-between">
            <div>
              <div className="italic text-sm text-gray-400">
                <DateString date={date} />
              </div>
              <h2 className="font-large font-semibold">
                <Link href={post.url}>{post.title}</Link>
              </h2>
              {/*<p>{post.summary}</p>*/}
            </div>
          </div>
        );
      })}
    </>
  );
}
