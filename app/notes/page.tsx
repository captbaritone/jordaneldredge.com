import Link from "next/link";
import ListItem from "../../lib/components/ListItem";
import { Content } from "../../lib/data";

// Pages are static
export const dynamic = "force-static";
// But might change, so we'll revalidate every 10 minutes
// https://beta.nextjs.org/docs/data-fetching/caching#segment-level-caching
export const revalidate = 10;

export const metadata = {
  title: "Notes",
  twitter: {
    title: "Notes",
  },
};

export default async function Notes() {
  const allNotes = Content.notes();
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
      {allNotes.map((post) => {
        return <ListItem key={post.slug()} item={post} />;
      })}
    </>
  );
}
