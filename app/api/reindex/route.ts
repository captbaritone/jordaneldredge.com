import * as Search from "../../../lib/search";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await Search.getDb();
  await Search.reindex(db);
  return new Response(JSON.stringify({ status: "ok" }));
}
