import { Feed, Item } from "feed";
import * as Data from "../../../../../lib/data";
import { VC } from "../../../../../lib/VC";

export const revalidate = 10;
export const dynamic = "force-static";

export async function GET() {
  const vc = VC.forScripts();
  const allContent = Data.ContentConnection.all(vc, {
    sort: "latest",
    filters: ["showInLists"],
  });
  // Never include drafts in RSS feeds
  const publicContent = allContent.filter((content) => !content.isDraft());
  const feed = await buildRssFeedLazy(publicContent);

  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

async function buildRssFeedLazy(allPosts: Data.Content[]) {
  const siteURL = "https://jordaneldredge.com";
  const author = {
    name: "Jordan Eldredge",
    email: "jordan@jordaneldredge.com",
    link: siteURL,
  };
  const date = new Date();

  const feed = new Feed({
    title: "Jordan Eldredge's Blog Podcast",
    description:
      "Personal blog of Jordan Eldredge, software engineer and musician, read by AI.",
    id: siteURL,
    link: siteURL,
    image: `${siteURL}/images/avatar.jpg`,
    favicon: `${siteURL}/favicon.ico`,
    copyright: `All rights reserved ${date.getFullYear()}, ${author.name}`,
    updated: date,
    language: "en",
    generator: "Feed for Node.js",
    feedLinks: {
      rss2: `${siteURL}/podcast`,
    },
    author,
  });

  const items = await Promise.all(
    allPosts.map(async (post): Promise<Item | null> => {
      const url = post.url().fullyQualified();
      const id = post.feedId();
      let summaryImage = await post.summaryImage();
      if (summaryImage != null && !summaryImage.startsWith("http")) {
        summaryImage = `${siteURL}${summaryImage}`;
      }
      const ttsAudio = post.ttsAudio();
      if (ttsAudio == null) {
        return null;
      }
      return {
        title: post.title(),
        id,
        link: url,
        description: post.summary(),
        content: `Read the post at ${url}`,
        author: [author],
        contributor: [],
        date: post.dateObj(),
        image: summaryImage, // This seems to get replaced by the audio enclosure
        audio: {
          url: ttsAudio.vanityUrl().fullyQualified(),
          type: "audio/mpeg",
          duration: ttsAudio.byteLength(),
        },
      };
    }),
  );
  for (const item of items) {
    if (item != null) {
      feed.addItem(item);
    }
  }
  return feed;
}
