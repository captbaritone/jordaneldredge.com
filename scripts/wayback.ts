import "dotenv/config";
import { db } from "../lib/db";

async function main() {
  const links = db
    .prepare<[], { link_url: string }>(`SELECT link_url FROM content_links;`)
    .all();
  for (const row of links) {
    const linkUrl = row.link_url;
    try {
      const snapshotUrl = await getOrSaveWaybackSnapshot(linkUrl);
      console.log(`Archived ${linkUrl} to ${snapshotUrl}`);
    } catch (error) {
      console.error(`Failed to archive ${linkUrl}: ${error}`);
    }
  }
}

main();

async function getOrSaveWaybackSnapshot(targetUrl: string): Promise<string> {
  const checkUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(targetUrl)}`;
  const res = await fetch(checkUrl);
  if (!res.ok) {
    throw new Error(`Failed to check Wayback URL: ${res.statusText}`);
  }
  const json = await res.json();

  const closest = json?.archived_snapshots?.closest;
  if (closest?.available && closest?.url) {
    console.log(json);
    return closest.url;
  }

  const saveRes = await fetch(
    `https://web.archive.org/save/${encodeURIComponent(targetUrl)}`,
    {
      method: "GET",
      redirect: "manual", // So we can inspect headers
    },
  );

  const location = saveRes.headers.get("Content-Location");
  if (location) {
    return `https://web.archive.org${location}`;
  }
  console.log(saveRes);

  throw new Error("Failed to archive URL");
}
