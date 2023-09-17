"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, use } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function Search() {
  const [query, setQuery] = useSearchQuery();
  const [results, setResults] = useState([]);
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
        <h1>
          <input
            placeholder="Search..."
            onChange={(e) => setQuery(e.target.value)}
            style={{
              border: "1px solid grey",
              padding: "0.5rem",
              width: "100%",
              borderRadius: "0.5rem",
            }}
            value={query}
            autoFocus
          />
        </h1>
      </div>
      {query ? (
        <Results results={results} loading={loading} query={query} />
      ) : (
        <ResultAlternative>
          Search for posts, pages, and notes
        </ResultAlternative>
      )}
    </>
  );
}

function ResultAlternative({ children }) {
  return (
    <h2
      style={{
        // center
        textAlign: "center",
        paddingBottom: "1.5rem",
        color: "grey",
      }}
    >
      {children}
    </h2>
  );
}

function Results({ results, loading, query }) {
  if (results.length === 0) {
    if (loading) {
      return <ResultAlternative>Loading...</ResultAlternative>;
    }
    return (
      <ResultAlternative>
        No results found for {'"'}
        {query}
        {'"'}
      </ResultAlternative>
    );
  }
  return (
    <>
      {results.map((post) => {
        return (
          <div key={post.url} className="py-4 flex justify-between">
            <div>
              <h3 className="font-large font-semibold">
                <Link href={post.url}>{post.title}</Link>
              </h3>
            </div>
          </div>
        );
      })}
    </>
  );
}

function useSearchQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams);
      if (!value) {
        params.delete(name);
      } else {
        params.set(name, value);
      }

      return params.toString();
    },
    [searchParams]
  );

  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    router.replace(pathname + "?" + createQueryString("q", query));
  }, [query, pathname, createQueryString, router]);

  return [query, setQuery];
}
