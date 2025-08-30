import { Feed, Item } from "feed";
import * as Data from "../../../../../lib/data";
import { NextRequest } from "next/server";
import { Enclosure } from "feed/lib/typings";
import { VC } from "../../../../../lib/VC";

export const revalidate = 10;
export const dynamic = "force-static";

const NOTES_EPOCH = new Date("2024-07-22");

export async function GET(request: NextRequest, props) {
  const params = await props.params;
  const vc = VC.forScripts();
  const posts = Data.ContentConnection.all(vc, {
    sort: "latest",
    filters: ["showInLists"],
  });

  const publicPosts = posts.filter((content) => {
    // For legacy reasons we omit notes from before they were included in RSS.
    if (content.pageType() === "note") {
      const date = content.dateObj();
      return date >= NOTES_EPOCH;
    }
    return true;
  });

  const feed = await buildRssFeedLazy(publicPosts);

  switch (params.kind) {
    case "rss.xml":
      return new Response(feed.rss2(), {
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      });
    case "rss.json":
      return new Response(feed.json1(), {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    case "atom.xml":
      return new Response(feed.atom1(), {
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      });
    default:
      return new Response("Not found", { status: 404 });
  }
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
    title: "Jordan Eldredge's Blog",
    description:
      "Personal blog of Jordan Eldredge, software engineer and musician.",
    id: siteURL,
    link: siteURL,
    image: `${siteURL}/images/avatar.jpg`,
    favicon: `${siteURL}/favicon.ico`,
    copyright: `All rights reserved ${date.getFullYear()}, ${author.name}`,
    updated: date,
    language: "en",
    generator: "Feed for Node.js",
    feedLinks: {
      rss2: `${siteURL}/feed/rss.xml`,
      json: `${siteURL}/feed/rss.json`,
      atom: `${siteURL}/feed/atom.xml`,
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

      // Disabled until we figure out how to have this not clobber the image
      // const audioUrl = post.publicAudioUrl();
      // if (audioUrl != null && false) {
      //   // TODO: Add `length` which is in bytes
      //   enclosure = { url: audioUrl.fullyQualified(), type: "audio/mpeg" };
      // }
      return {
        title: post.title(),
        id,
        link: url,
        description: post.summary(),
        content: post.summary(),
        author: [author],
        contributor: [],
        date: post.dateObj(),
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
