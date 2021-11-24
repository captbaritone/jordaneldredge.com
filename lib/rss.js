import { Feed } from "feed";

export default function buildRssFeed(allPosts) {
  const siteURL = "https://jordaneldredge.com";
  const author = "Jordan Eldredge";
  const date = new Date();

  const feed = new Feed({
    title: "Jordan Eldredge's Blog",
    description: "",
    id: siteURL,
    link: siteURL,
    image: `${siteURL}/images/avatar.jpg`,
    favicon: `${siteURL}/favicon.ico`,
    copyright: `All rights reserved ${date.getFullYear()}, ${author}`,
    updated: date,
    generator: "Feed for Node.js",
    feedLinks: {
      rss2: `${siteURL}/rss.xml`,
      // json: `${siteURL}/rss/feed.json`,
      // atom: `${siteURL}/rss/atom.xml`,
    },
    author,
  });

  allPosts.forEach((post) => {
    const url = `${siteURL}/blog/${post.slug}`;
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.summary,
      content: post.summary,
      author: [author],
      contributor: [],
      date: new Date(post.date),
    });
  });

  return feed.rss2();
}
