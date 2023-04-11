import { getPageBySlug } from "../../lib/api";
import RootPage from "../RootPage";

export function generateMetadata({ params }) {
  const page = getPageBySlug(params.slug, ["title"]);
  return {
    title: page.title,
    twitter: {
      title: page.title,
    },
    openGraph: {
      type: "article",
    },
  };
}

export default function Page({ params, searchParams }) {
  return <RootPage slug={params.slug} />;
}
