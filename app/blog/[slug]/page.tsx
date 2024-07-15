import * as Data from "../../../lib/data";
import GitHubComments from "../../../lib/components/GitHubComments";
import DateString from "../../../lib/components/DateString";
import Markdown from "../../../lib/components/Markdown";
import TagList from "../../../lib/components/TagList";

export function generateMetadata({ params }) {
  const post = Data.getPostBySlug(params.slug);
  const summaryImage = post.summaryImage();
  return {
    title: post.title(),
    description: post.summary() || post.title(),
    twitter: {
      title: post.title(),
      images: summaryImage ? [{ url: summaryImage }] : [],
      description: post.summary() || post.title(),
    },
    openGraph: {
      title: post.title(),
      images: summaryImage ? [{ url: summaryImage }] : [],
      type: "article",
    },
    alternates: {
      canonical: post.canonicalUrl() || null,
    },
  };
}

export async function generateStaticParams() {
  const posts = Data.getAllPosts();
  return posts.map((post) => {
    return {
      slug: post.slug(),
    };
  });
}

// Do not try to render arbitrary slugs
export const dynamicParams = false;

export default async function Post({ params }) {
  const post = Data.getPostBySlug(params.slug);

  const ast = await post.content().ast();
  // const typoLink = `https://github.com/captbaritone/jordaneldredge.com/blob/master/_posts/${post.filename}`;
  const tags = post.tags();
  const issueId = post.githubCommentsIssueId();
  return (
    <>
      <div className="markdown">
        <h1>{post.title()}</h1>
        <div
          className="italic text-sm text-gray-400"
          style={{
            marginTop: "-1.4rem",
            marginBottom: "1rem",
          }}
        >
          <DateString date={new Date(post.date())} />
        </div>
        <Markdown ast={ast} />
      </div>
      <TagList tags={tags} />
      {issueId && <GitHubComments issue={issueId} />}
    </>
  );
}
