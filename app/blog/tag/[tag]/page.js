import * as Api from "../../../../lib/api.mjs";
import BlogPostListItem from "../../../../lib/components/BlogPostListItem";

export function generateMetadata({ params }) {
  const title = `Blog posts tagged "${params.tag}"`;
  return { title, twitter: { title } };
}

export default async function TagPage({ params }) {
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
    (postInfo) =>
      !postInfo.archive &&
      !postInfo.draft &&
      postInfo?.tags?.includes(params.tag)
  );

  if (publicPosts.length === 0) {
    // TODO: 404?
  }

  return (
    <>
      <div className="markdown">
        <h1>Blog posts tagged "{params.tag}"</h1>
        <hr />
      </div>
      {publicPosts.map((post) => {
        return <BlogPostListItem key={post.slug} post={post} />;
      })}
    </>
  );
}
