import { Feed } from "feed";
import * as Data from "../../../../lib/data";
import { NextRequest } from "next/server";

export const revalidate = 600;
export const dynamic = "force-static";

const NOTES_EPOCH = new Date("2024-07-22");

export async function GET(request: NextRequest, { params }) {
  const allPosts = Data.getAllPosts();
  const allNotes = await Data.getAllNotes();
  const visibleNotes = allNotes.filter((note) => {
    // Notes were not originally included in the feed. To avoid dumping all of
    // them into the feed retroactively, only include notes starting at around
    // the time they were added to the feed.
    const date = new Date(note.date());
    return date >= NOTES_EPOCH;
  });

  const allContent = [...allPosts, ...visibleNotes];

  const publicPosts = allContent.filter((post) => post.showInLists());

  publicPosts.sort((a, b) => {
    return new Date(b.date()).getTime() - new Date(a.date()).getTime();
  });

  const feed = await buildRssFeedLazy(publicPosts);

  switch (params.kind) {
    case "rss.xml":
    case "rss-beta.xml":
      return new Response(feed.rss2(), {
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      });
    case "rss.json":
    case "rss-beta.json":
      return new Response(feed.json1(), {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    case "atom.xml":
    case "atom-beta.xml":
      return new Response(feed.atom1(), {
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      });
    default:
      return new Response("Not found", { status: 404 });
  }
}

async function buildRssFeedLazy(allPosts: Data.Listable[]) {
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
    allPosts.map(async (post) => {
      const url = post.url().fullyQualified();
      const id = post.feedId();
      let summaryImage = await post.summaryImage();
      if (summaryImage != null && !summaryImage.startsWith("http")) {
        summaryImage = `${siteURL}${summaryImage}`;
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
      };
    })
  );
  for (const item of items) {
    feed.addItem(item);
  }
  return feed;
}
