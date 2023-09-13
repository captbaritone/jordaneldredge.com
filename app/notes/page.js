import { getNotes, getMetadata } from "./notion";
import DateString from "../../lib/components/DateString";
import Link from "next/link";

// https://beta.nextjs.org/docs/data-fetching/caching#segment-level-caching
export const revalidate = 600;

export const metadata = {
  title: "Notes",
  twitter: {
    title: "Notes",
  },
};

export default async function Notes({ searchParams }) {
  const [{ idToSlug }, childPages] = await Promise.all([
    getMetadata(),
    getNotes(),
  ]);
  return (
    <>
      <div className="markdown">
        <h1>Notes</h1>
        <p>
          Quick thoughts, observations, and links.
          <br />
          For more formal writing see <Link href="/blog">Blog</Link>.{" "}
        </p>
        <hr />
      </div>
      {childPages.map((post) => {
        const slug = idToSlug[post.id] || post.id;
        return (
          <div key={slug} className="py-4 flex justify-between">
            <div>
              <div className="italic text-sm text-gray-400">
                <DateString date={new Date(post.created_time)} />
              </div>
              <h2 className="font-large font-semibold">
                <Link href={`/notes/${slug}`}>{post.child_page.title}</Link>
              </h2>
            </div>
          </div>
        );
      })}
    </>
  );
}
