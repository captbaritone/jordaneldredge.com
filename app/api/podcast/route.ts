import { Feed, Item } from "feed";
import * as Data from "../../../lib/data";
import { NextRequest } from "next/server";
import { Enclosure } from "feed/lib/typings";

export const revalidate = 600;
export const dynamic = "force-static";

export async function GET(request: NextRequest, { params }) {
  const allPosts = Data.Content.blogPosts();
  const allNotes = Data.Content.notes();

  const allContent = [...allPosts, ...allNotes];

  const publicPosts = allContent.filter((post) => post.showInLists());

  publicPosts.sort((a, b) => {
    const dateDiff =
      new Date(b.date()).getTime() - new Date(a.date()).getTime();
    if (dateDiff !== 0) {
      return dateDiff;
    }
    // Sort by title
    return b.title().localeCompare(a.title());
  });

  const feed = await buildRssFeedLazy(publicPosts);

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
    allPosts.map(async (post): Promise<Item> => {
      const url = post.url().fullyQualified();
      const id = post.feedId();
      let summaryImage = await post.summaryImage();
      if (summaryImage != null && !summaryImage.startsWith("http")) {
        summaryImage = `${siteURL}${summaryImage}`;
      }
      let enclosure: Enclosure | undefined;

      const ttsAudio = post.ttsAudio();
      if (ttsAudio != null) {
        enclosure = {
          url: ttsAudio.vanityUrl().fullyQualified(),
          type: "audio/mpeg",
          duration: ttsAudio.byteLength(),
        };
      }
      return {
        title: post.title(),
        id,
        link: url,
        description: post.summary(),
        content: post.summary(),
        author: [author],
        contributor: [],
        date: new Date(post.date()),
        image: summaryImage,
        audio: enclosure,
      };
    }),
  );
  for (const item of items) {
    feed.addItem(item);
  }
  return feed;
}
