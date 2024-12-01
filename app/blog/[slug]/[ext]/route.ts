import { NextRequest } from "next/server";
import { ListableSearchRow } from "../../../../lib/data";

// NOTE: This route depends upon a rewrite in the project config to allow it to match:
// /blog/<slug>.md
export async function GET(_: NextRequest, { params }) {
  const { slug: fullSlug, ext } = params;
  const slug = fullSlug.slice(0, fullSlug.length - ext.length - 1);
  switch (ext) {
    case "md": {
      const post = ListableSearchRow.getPostBySlug(slug);
      if (post == null) {
        return new Response("Not found", { status: 404 });
      }
      return new Response(post.contentWithHeader());
    }
    default:
      return new Response("Not found", { status: 404 });
  }
}
