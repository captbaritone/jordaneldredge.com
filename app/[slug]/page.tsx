import { getPageBySlug } from "../../lib/data/data";
import RootPage from "../RootPage";

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

export default function Page({ params, searchParams }) {
  return <RootPage slug={params.slug} />;
}