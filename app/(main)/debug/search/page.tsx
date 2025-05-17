"use client";

import { useEffect, useState } from "react";
import { lex } from "../../../../lib/services/search/Lexer";
import {
  Compiler,
  SchemaConfig,
  SortOption,
} from "../../../../lib/services/search/Compiler";
import { parse } from "../../../../lib/services/search/Parser";

const config: SchemaConfig = {
  ftsTable: "contentFts",
  ftsTextColumns: ["text"],
  contentTable: "content",
  hardCodedConditions: [],
  isConditions: {},
  hasConditions: {},
  defaultBestSort: "",
};

function debugCompiler(
  config: SchemaConfig,
  query: string,
  sort: SortOption,
  limit: number,
) {
  const tokenResult = lex(query);
  const parseResult = parse(tokenResult.value);
  const compiler = new Compiler(config, sort, limit);
  compiler.compile(parseResult.value);
  const warnings = [
    ...tokenResult.warnings,
    ...parseResult.warnings,
    ...compiler._warnings,
  ];
  return {
    tokens: tokenResult.value,
    ast: parseResult.value,
    sql: compiler.serialize(),
    params: compiler.params,
    warnings,
  };
}

function getInitialState() {
  if (typeof window === "undefined") {
    return "";
  }
  const url = new URL(window.location.href);
  const queryParam = url.searchParams.get("query");
  return queryParam !== null ? decodeURIComponent(queryParam) : "";
}

function useQueryFromUrl(): [string, (query: string) => void] {
  const [query, setQuery] = useState(getInitialState);
  const updateQuery = (newQuery: string) => {
    setQuery(newQuery);
    const url = new URL(window.location.href);
    url.searchParams.set("query", newQuery);
    window.history.pushState({}, "", url.toString());
  };
  useEffect(() => {
    const handlePopState = () => {
      const url = new URL(window.location.href);
      const newQuery = url.searchParams.get("query");
      if (newQuery !== null) {
        setQuery(newQuery);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
  return [query, updateQuery];
}

export default function SearchDebugPage() {
  const [query, setQuery] = useQueryFromUrl();
  return (
    <div className="markdown">
      <h1>Search Debug</h1>
      <p>
        <label htmlFor="query">Query:</label>{" "}
        <input
          id="query"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-gray-300 rounded-md p-2"
        />
      </p>
      <Details query={query} />
    </div>
  );
}

function Pre({ children }) {
  return <pre style={{ fontSize: "0.6em", lineHeight: "1.5" }}>{children}</pre>;
}

export function Details({ query }) {
  let results;
  try {
    results = debugCompiler(config, query, "best", 10);
  } catch (e) {
    return (
      <div>
        <h2>Error</h2>
        <details>
          <summary>Click to expand</summary>
          <Pre>{e.stack}</Pre>
        </details>
      </div>
    );
  }
  const { tokens, ast, sql, params, warnings } = results;
  return (
    <>
      {warnings.length > 0 && (
        <>
          <h2>Warnings</h2>
          <details>
            <summary>Click to expand</summary>
            <Pre>{warnings.map((w) => w.message).join("\n")}</Pre>
          </details>
        </>
      )}
      <h2>Tokens</h2>
      <details>
        <summary>Click to expand</summary>
        <Pre>{tokens.map((t) => JSON.stringify(t)).join("\n")}</Pre>
      </details>
      <h2>AST</h2>
      <details>
        <summary>Click to expand</summary>
        <Pre>{JSON.stringify(ast, null, 2)}</Pre>
      </details>
      <h2>SQL</h2>
      <details>
        <summary>Click to expand</summary>
        <Pre>{sql}</Pre>
      </details>
      <h2>Params</h2>
      <details>
        <summary>Click to expand</summary>
        <Pre>{JSON.stringify(params, null, 2)}</Pre>
      </details>
    </>
  );
}
