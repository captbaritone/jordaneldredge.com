"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function Search({ query }) {
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
    <div className="markdown" data-pending={pending ? "" : undefined}>
      <h1>Search</h1>
      <input
        placeholder="Find posts, notes and pages"
        onChange={(e) => updateQuery(e.target.value)}
        style={{
          border: "1px solid grey",
          padding: "0.5rem",
          marginBottom: "1rem",
          width: "100%",
          borderRadius: "0.5rem",
        }}
        value={optimisticQuery}
        autoFocus
      />
    </div>
  );
}
