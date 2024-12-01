import * as Indexable from "../../../lib/data/Indexable";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  await Indexable.reindex({ force: false });
  revalidatePath("/");
  return new Response(JSON.stringify({ status: "ok" }));
}
