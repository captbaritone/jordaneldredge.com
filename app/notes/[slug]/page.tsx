import { Content } from "../../../lib/data";
import { Metadata } from "next";
import ContentPage from "../../../lib/components/ContentPage";

// https://beta.nextjs.org/docs/data-fetching/caching#segment-level-caching
export const revalidate = 10;
export const dynamic = "force-static";

export async function generateMetadata({ params }): Promise<Metadata> {
  // TODO: Figure out how to read search params in head.js
  const note = Content.getNoteBySlug(params.slug);
  if (note == null) {
    throw new Error("Not found");
  }
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

export default function Note({ params }) {
  const note = Content.getNoteBySlug(params.slug);
  if (note == null) {
    throw new Error("Not found");
  }
  return <ContentPage item={note} />;
}
