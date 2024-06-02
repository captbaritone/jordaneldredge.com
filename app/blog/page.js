import * as Api from "../../lib/api.mjs";
import Link from "next/link";
import BlogPostListItem from "../../lib/components/BlogPostListItem";

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
    "tags",
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
        return <BlogPostListItem key={post.slug} post={post} />;
      })}
    </>
  );
}
