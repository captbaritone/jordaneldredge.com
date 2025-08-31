import Link from "next/link";

export default function NotFound() {
  return (
    <article>
      <div className="markdown">
        <h1>404 - Page Not Found</h1>
        <p>
          The page you are looking for could not be found. Perhaps try{" "}
          <Link href="/search">searching</Link>. If you think this in an error,{" "}
          <Link href="/contact">let me know</Link>.
        </p>
      </div>
    </article>
  );
}
