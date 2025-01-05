import * as Indexable from "../../../../lib/data/Indexable";

export const dynamic = "force-dynamic";

export async function GET() {
  await Indexable.reindex({ force: false, filter: null });
  return new Response(JSON.stringify({ status: "ok" }));
}
