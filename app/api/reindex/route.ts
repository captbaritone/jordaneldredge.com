import * as Search from "../../../lib/search";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await Search.getDb();
  await Search.reindex(db);
  revalidatePath("/");
  return new Response(JSON.stringify({ status: "ok" }));
}
