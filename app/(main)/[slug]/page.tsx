import { getAllPages, getPageBySlug } from "../../../lib/data";
import RootPage from "../../RootPage";

export function generateMetadata({ params }) {
  const page = getPageBySlug(params.slug);
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

export async function generateStaticParams() {
  const pages = getAllPages();
  return pages.map((page) => {
    return { slug: page.slug() };
  });
}

// Do not try to render arbitrary slugs
export const dynamicParams = false;

export default function Page({ params }) {
  return <RootPage slug={params.slug} />;
}
