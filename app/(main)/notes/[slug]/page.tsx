import { Content } from "../../../../lib/data";
import { Metadata } from "next";
import ContentPage, {
  contentMetadata,
} from "../../../../lib/components/ContentPage";
import { VC } from "../../../../lib/VC";

// https://beta.nextjs.org/docs/data-fetching/caching#segment-level-caching
// export const revalidate = 10;
// export const dynamic = "force-static";

export async function generateMetadata(props): Promise<Metadata> {
  const params = await props.params;
  // Create viewer context
  const vc = await VC.create();

  // TODO: Figure out how to read search params in head.js
  const note = Content.getNoteBySlug(vc, params.slug);
  if (note == null) {
    throw new Error("Not found");
  }
  return contentMetadata(note);
}

export default async function Note(props) {
  const params = await props.params;
  // Create viewer context
  const vc = await VC.create();

  const note = Content.getNoteBySlug(vc, params.slug);
  if (note == null) {
    return {};
  }
  return <ContentPage item={note} vc={vc} />;
}
