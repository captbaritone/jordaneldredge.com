import { Feed } from "feed";
import * as Data from "../../../lib/data";

export const revalidate = 600;

export default async function handler(req, res) {
  const allPosts = Data.getAllPosts();

  const publicPosts = allPosts.filter((post) => post.showInLists());

  const feed = buildRssFeedLazy(publicPosts);

  switch (req.query.kind) {
    case "rss.xml":
      res.end(feed.rss2());
      break;
    case "rss.json":
      res.end(feed.json1());
      break;
    case "atom.xml":
      res.end(feed.atom1());
      break;
    default:
      res.status(404).end();
  }
}

function buildRssFeedLazy(allPosts: Data.Post[]) {
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

  allPosts.forEach((post) => {
    const url = post.url().fullyQualified();
    feed.addItem({
      title: post.title(),
      id: url,
      link: url,
      description: post.summary(),
      content: post.summary(),
      author: [author],
      contributor: [],
      date: new Date(post.date()),
      image: post.summaryImage()
        ? `${siteURL}${post.summaryImage()}`
        : undefined,
    });
  });
  return feed;
}
