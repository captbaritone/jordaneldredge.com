import * as Data from "../../lib/data";
import Link from "next/link";
import ListItem from "../../lib/components/ListItem";

// Pages are static
export const dynamic = "force-static";
// But might change, so we'll revalidate every 10 minutes
// https://beta.nextjs.org/docs/data-fetching/caching#segment-level-caching
export const revalidate = 600;

export const metadata = {
  title: "Notes",
  twitter: {
    title: "Notes",
  },
};

export default async function Notes() {
  const childPages = await Data.getAllNotes();
  return (
    <>
      <div className="markdown">
        <h1>Notes</h1>
        <p>
          Quick thoughts, observations, and links. For more formal writing see{" "}
          <Link href="/blog">Blog</Link>.{" "}
        </p>
        <hr />
      </div>
      {childPages.map((post) => {
        return <ListItem key={post.slug()} item={post} />;
      })}
    </>
  );
}
