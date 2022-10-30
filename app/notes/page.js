import { getTilPages } from "./notion";
import DateString from "../../lib/components/DateString";
import Link from "next/link";

export default async function Notes() {
  const childPages = await getTilPages();
  return (
    <>
      <div className="markdown">
        <h1>Notes</h1>
        <p>
          Quick notes sharing things I find interesting. For more formal posts,
          see my <Link href={"/blog"}>blog</Link>.
        </p>
        <hr />
      </div>
      {childPages.map((post) => {
        return (
          <div key={post.id} className="py-4 flex justify-between">
            <div>
              <div className="italic text-sm text-gray-400">
                <DateString date={new Date(post.created_time)} />
              </div>
              <h2 className="font-large font-semibold">
                <Link as={`/notes/${post.id}`} href="/notes/[slug]">
                  {post.child_page.title}
                </Link>
              </h2>
            </div>
          </div>
        );
      })}
    </>
  );
}
