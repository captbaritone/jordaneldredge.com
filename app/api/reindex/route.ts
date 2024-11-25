import * as Search from "../../../lib/search";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  await Search.reindex();
  revalidatePath("/");
  return new Response(JSON.stringify({ status: "ok" }));
}
