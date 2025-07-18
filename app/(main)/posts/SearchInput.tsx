"use client";

import { useEffect, startTransition, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateQuery(query: string) {
    const newParams = new URLSearchParams(
      // Ensure we preserve the sort parameter if it exists
      Array.from(searchParams!.entries()),
    );
    newParams.set("q", query);

    startTransition(() => {
      // Originally I had the input as a controlled component, which I would
      // update here via a `useOptimistic` value. However, I was experiencing
      // dropped characters when typing quickly, so I switched to an
      // uncontrolled component.

      // I suspect that the transition context is not correctly propagated
      // through the Next.js router, which meant that the input value was
      // reverting slightly _before_ the new state came in.

      // If/when that issues is resolved, we can switch back to a
      // controlled component with `useOptimistic`. This is preferable since it
      // would allow us to show the user an accurate loading state while the
      // search is being performed.
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
          onKeyDown={(e) => {
            console.log("Key down in SearchInput", e.key);
          }}
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
          defaultValue={query}
          autoFocus={autoFocus}
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
