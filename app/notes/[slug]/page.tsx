import * as Data from "../../../lib/data";
import { Metadata } from "next";
import ContentPage from "../../../lib/components/ContentPage";

// https://beta.nextjs.org/docs/data-fetching/caching#segment-level-caching
export const revalidate = 600;
export const dynamic = "force-static";

export async function generateMetadata({ params }): Promise<Metadata> {
  // TODO: Figure out how to read search params in head.js
  const note = await Data.getNoteBySlug(params.slug);
  const summaryImage = await note.summaryImage();
  return {
    title: note.title(),
    description: note.summary() || note.title(),
    twitter: {
      title: note.title(),
      images: summaryImage ? [{ url: summaryImage }] : [],
      description: note.summary() || note.title(),
    },
    openGraph: {
      title: note.title(),
      images: summaryImage ? [{ url: summaryImage }] : [],
      type: "article",
    },
  };
}

export default async function Note({ params }) {
  const note = await Data.getNoteBySlug(params.slug);
  return <ContentPage item={note} expandYoutube={false} />;
}
