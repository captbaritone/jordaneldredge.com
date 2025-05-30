import { Content } from "../../../../lib/data";
import { Metadata } from "next";
import ContentPage from "../../../../lib/components/ContentPage";

// https://beta.nextjs.org/docs/data-fetching/caching#segment-level-caching
// export const revalidate = 10;
// export const dynamic = "force-static";

export async function generateMetadata(props): Promise<Metadata> {
  const params = await props.params;
  // TODO: Figure out how to read search params in head.js
  const note = Content.getNoteBySlug(params.slug);
  if (note == null) {
    throw new Error("Not found");
  }
  const summaryImage = note.summaryImage();
  return {
    title: note.title(),
    description: note.summary() || note.title(),
    twitter: {
      title: note.title(),
      images: summaryImage ? [{ url: summaryImage }] : [],
      description: note.summary() || note.title(),
    },
    openGraph: {
      url: note.url().fullyQualified(),
      title: note.title(),
      images: summaryImage ? [{ url: summaryImage }] : [],
      type: "article",
    },
  };
}

export default async function Note(props) {
  const params = await props.params;
  const note = Content.getNoteBySlug(params.slug);
  if (note == null) {
    throw new Error("Not found");
  }
  return <ContentPage item={note} />;
}
