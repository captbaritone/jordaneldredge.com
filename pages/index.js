import Link from "next/link";

export default function Page({}) {
  return (
    <div>
      <p>
        Click this link: <Link href="/notes">Notes</Link>.
      </p>
      <p>
        It should render `app/notes/page.js` but it doesn't. Instead it uses
        `pages/[slug].js`.
      </p>
    </div>
  );
}
