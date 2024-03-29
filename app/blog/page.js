import * as Api from "../../lib/api.mjs";
import Link from "next/link";
import DateString from "../../lib/components/DateString";
import Image from "next/image.js";

const SHOW_IMAGES = false;

export const metadata = {
  title: "Blog",
  twitter: {
    title: "Blog",
  },
};

export default async function Home() {
  const allPosts = await Api.getAllPosts([
    "title",
    "slug",
    "summary",
    "archive",
    "date",
    "draft",
    "summary_image",
  ]);

  const publicPosts = allPosts.filter(
    (postInfo) => !postInfo.archive && !postInfo.draft
  );

  return (
    <>
      <div className="markdown">
        <h1>Blog</h1>
        <p>
          Formal write-ups of projects and ideas.
          <br />
          For quick thoughts, observations, and links see{" "}
          <Link href="/notes">Notes</Link>.
        </p>
        <hr />
      </div>
      {publicPosts.map((post) => {
        return (
          <div key={post.slug} className="py-4 flex justify-between">
            <div>
              <div className="italic text-sm text-gray-400">
                <DateString date={new Date(post.date)} />
              </div>
              <h2 className="font-large font-semibold">
                <Link
                  href={`/blog/${post.slug}`}
                  style={{
                    wordBreak: "break-word",
                    /* Adds a hyphen where the word breaks, if supported (No Blink) */
                    hyphens: "auto",
                  }}
                >
                  {post.title}
                </Link>
              </h2>
              <p>{post.summary}</p>
            </div>
            {post.summary_image && SHOW_IMAGES ? (
              <Image
                width={100}
                height={100}
                alt={`Header image for a post titled "${post.title}."`}
                src={post.summary_image}
                className="rounded h-20 ml-6 mt-6 ring-gray-400 shadow-inner-md"
              />
            ) : (
              <div />
            )}
          </div>
        );
      })}
    </>
  );
}
