"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function SearchInput({ query }) {
  let router = useRouter();
  let [optimisticQuery, setOptimisticQuery] = useOptimistic(query);
  let [pending, startTransition] = useTransition();

  function updateQuery(query: string) {
    let newParams = new URLSearchParams([["q", query]]);

    startTransition(() => {
      setOptimisticQuery(query);
      router.replace(`?${newParams}`);
    });
  }
  return (
    <input
      onChange={(e) => updateQuery(e.target.value)}
      style={{
        display: "inline",
        border: "1px solid lightgrey",
        paddingLeft: "0.5rem",
        paddingRight: "0.5rem",
        marginLeft: "0.5rem",
        marginRight: "0.5rem",
        borderRadius: "0.5rem",
        height: "2rem",
        // https://stackoverflow.com/a/6394497
        fontSize: "16px",
      }}
      value={optimisticQuery}
      autoFocus={query != null}
      type="search"
      name="q"
      placeholder="Search..."
    />
  );
}
