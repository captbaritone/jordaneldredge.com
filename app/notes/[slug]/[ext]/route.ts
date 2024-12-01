import { NextRequest } from "next/server";
import { ListableSearchRow } from "../../../../lib/data";

export const revalidate = 600;
export const dynamic = "force-static";

// NOTE: This route depends upon a rewrite in the project config to allow it to match:
// /notes/<slug>.md
export async function GET(_: NextRequest, { params }) {
  const { slug: fullSlug, ext } = params;
  const slug = fullSlug.slice(0, fullSlug.length - ext.length - 1);
  switch (ext) {
    case "md": {
      const note = ListableSearchRow.getNoteBySlug(slug);
      if (note == null) {
        return new Response("Not found", { status: 404 });
      }
      const content = note.contentWithHeader();
      return new Response(content);
    }
    default:
      return new Response("Not found", { status: 404 });
  }
}
