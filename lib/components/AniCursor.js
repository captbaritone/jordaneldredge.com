"use client";
import { useEffect, useState } from "react";
import ErrorBoundary from "./ErrorrBoundary";

export default function AniCursor({ url, selector }) {
  return (
    <ErrorBoundary fallback={null}>
      <AniCursorImpl url={url} selector={selector} />
    </ErrorBoundary>
  );
}

function AniCursorImpl({ url, selector }) {
  const [css, setCss] = useState(null);
  useEffect(() => {
    const binaryPromise = fetch(url).then((response) => response.arrayBuffer());
    const aniCursorPromise = import("ani-cursor");
    Promise.all([binaryPromise, aniCursorPromise]).then(
      ([binary, aniCursor]) => {
        const data = new Uint8Array(binary);

        setCss(aniCursor.convertAniBinaryToCSS(selector, data));
      }
    );
  }, [url, selector]);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerText = css;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [css]);
  return null;
}
