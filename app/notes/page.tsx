import * as Data from "../../lib/data";
import Link from "next/link";
import ListItem from "../../lib/components/ListItem";

// https://beta.nextjs.org/docs/data-fetching/caching#segment-level-caching
export const revalidate = 600;

export const metadata = {
  title: "Notes",
  twitter: {
    title: "Notes",
  },
};

export default async function Notes({ searchParams }) {
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

/*
            <div>
              <div className="italic text-sm text-gray-400">
                <DateString date={new Date(post.date())} />
              </div>
              <h2 className="font-large font-semibold">
                <Link href={post.url()}>{post.title()}</Link>
              </h2>
            </div>
          </div>
          */
