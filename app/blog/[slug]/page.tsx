import * as Data from "../../../lib/data";
import ContentPage from "../../../lib/components/ContentPage";

export async function generateMetadata({ params }) {
  const post = Data.getPostBySlug(params.slug);
  const summaryImage = await post.summaryImage();
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
  const issueId = post.githubCommentsIssueId();
  return <ContentPage item={post} issueId={issueId} />;
}
