import { NextRequest } from "next/server";
import { Content } from "../../../../../lib/data";
import { VC } from "../../../../../lib/VC";

export const revalidate = 10;
export const dynamic = "force-static";

// NOTE: This route depends upon a rewrite in the project config to allow it to match:
// /notes/<slug>.md
export async function GET(_: NextRequest, props) {
  const params = await props.params;
  const { slug: fullSlug, ext } = params;
  const slug = fullSlug.slice(0, fullSlug.length - ext.length - 1);
  const vc = await VC.create();
  switch (ext) {
    case "md": {
      const note = Content.getNoteBySlug(vc, slug);
      if (note == null) {
        return new Response("Not found", { status: 404 });
      }
      const content = note.contentWithHeader();
      return new Response(content);
    }
    case "mp3": {
      const note = Content.getNoteBySlug(vc, slug);
      if (note == null) {
        return new Response("Not found", { status: 404 });
      }
      const ttsAudio = note.ttsAudio();
      if (ttsAudio == null) {
        return new Response("Not found", { status: 404 });
      }
      // Redirect to the audio file
      return Response.redirect(ttsAudio.url(), 302);
    }
    default:
      return new Response("Not found", { status: 404 });
  }
}
