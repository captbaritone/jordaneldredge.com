"use client";

import { useEffect, useOptimistic, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function SearchInput({ query, className, autoFocus }) {
  let router = useRouter();
  let [optimisticQuery, setOptimisticQuery] = useOptimistic(query);
  let [pending, startTransition] = useTransition();

  function updateQuery(query: string) {
    let newParams = new URLSearchParams([["q", query]]);

    startTransition(() => {
      setOptimisticQuery(query);
      router.replace(`?${newParams}`, { scroll: false });
    });
  }

  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [autoFocus]);
  return (
    <input
      ref={ref}
      onChange={(e) => updateQuery(e.target.value)}
      className={className}
      style={{
        display: "inline",
        border: "1px solid lightgrey",
        paddingLeft: "0.5rem",
        paddingRight: "0.5rem",
        marginRight: "0.5rem",
        borderRadius: "0.5rem",
        height: "2rem",
        // https://stackoverflow.com/a/6394497
        fontSize: "16px",
      }}
      value={optimisticQuery}
      autoFocus={autoFocus}
      type="search"
      name="q"
      placeholder="Search..."
    />
  );
}
