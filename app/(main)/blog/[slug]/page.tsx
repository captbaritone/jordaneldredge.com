import { Content } from "../../../../lib/data";
import ContentPage from "../../../../lib/components/ContentPage";
import { notFound } from "next/navigation";
import { VC } from "../../../../lib/VC";
import { Metadata } from "next";

export async function generateMetadata(props): Promise<Metadata> {
  const params = await props.params;
  // Create viewer context
  const vc = await VC.create();
  
  const post = Content.getPostBySlug(vc, params.slug);
  if (post == null) {
    return {};
  }
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
      url: post.url().fullyQualified(),
      title: post.title(),
      images: summaryImage ? [{ url: summaryImage }] : [],
      type: "article",
    },
    alternates: {
      canonical: post.canonicalUrl() || null,
    },
  };
}

// https://beta.nextjs.org/docs/data-fetching/caching#segment-level-caching
// export const revalidate = 10;
// export const dynamic = "force-static";

export default async function Post(props) {
  const params = await props.params;
  // Create viewer context
  const vc = await VC.create();
  
  const post = Content.getPostBySlug(vc, params.slug);
  if (post == null) {
    notFound();
  }
  const issueId = post.githubCommentsIssueId();
  return <ContentPage item={post} issueId={issueId} vc={vc} />;
}
