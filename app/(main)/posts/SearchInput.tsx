"use client";

import { useEffect, useOptimistic, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  query: string;
  className?: string;
  autoFocus?: boolean;
  warnings: string[];
};

const validationWarningClassName =
  "border border-yellow-500 bg-yellow-50 text-yellow-900 placeholder-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded";

export default function SearchInput({
  query,
  className,
  autoFocus,
  warnings,
}: Props) {
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
  if (warnings.length > 0) {
    className = `${className ?? ""} ${validationWarningClassName}`;
  }
  return (
    <>
      <div className="relative inline-block">
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
        {warnings.length > 0 && (
          <div className="absolute bottom-full mb-2 left-0 bg-yellow-100 border border-yellow-500 text-yellow-900 text-sm px-2 py-1 rounded shadow-md whitespace-nowrap z-10">
            {warnings.map((warning, index) => (
              <div key={index} className="mb-1">
                {warning}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
