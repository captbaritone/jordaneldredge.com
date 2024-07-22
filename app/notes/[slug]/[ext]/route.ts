import { NextRequest } from "next/server";
import { getNoteBySlug } from "../../../../lib/data";

// NOTE: This route depends upon a rewrite in the project config to allow it to match:
// /notes/<slug>.md
export async function GET(_: NextRequest, { params }) {
  const { slug: fullSlug, ext } = params;
  const slug = fullSlug.slice(0, fullSlug.length - ext.length - 1);
  switch (ext) {
    case "md": {
      const note = await getNoteBySlug(slug);
      const content = await note.contentWithHeader();
      return new Response(content.markdownString());
    }
    default:
      return new Response("Not found", { status: 404 });
  }
}
