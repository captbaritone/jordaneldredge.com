import { getAllPages, getPageBySlug, Content } from "../../../lib/data";
import RootPage from "../../RootPage";
import ContentPage, {
  contentMetadata,
} from "../../../lib/components/ContentPage";
import { notFound } from "next/navigation";
import { VC } from "../../../lib/VC";
import { Metadata } from "next";

export async function generateMetadata(props): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug;

  // If not a page, try to find it as a post or note
  const vc = await VC.create();
  const content = Content.getBySlug(vc, slug);

  if (content) {
    return contentMetadata(content);
  }

  // First, check if it's a standard page
  const page = getPageBySlug(slug);
  if (page) {
    return {
      title: page.title(),
      twitter: {
        title: page.title(),
      },
      openGraph: {
        type: "article",
      },
    };
  }
  return {};
}

export async function generateStaticParams() {
  const pages = getAllPages();
  return pages.map((page) => {
    return { slug: page.slug() };
  });
}

// Allow rendering arbitrary slugs for posts and notes
export const dynamicParams = true;

export default async function Page(props) {
  const params = await props.params;
  const slug = params.slug;

  // If not a page, try to find it as a post or note
  const vc = await VC.create();
  const content = Content.getBySlug(vc, slug);

  if (content) {
    const issueId = content.githubCommentsIssueId();
    return <ContentPage item={content} issueId={issueId} vc={vc} />;
  }

  // First, check if it's a standard page
  const page = getPageBySlug(slug);
  if (page) {
    return <RootPage page={page} />;
  }
  notFound();
}
