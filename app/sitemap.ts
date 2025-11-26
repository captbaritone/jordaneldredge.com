import { MetadataRoute } from "next";
import * as Data from "../lib/data";
import { VC } from "../lib/VC";

export const revalidate = 3600; // Revalidate every hour
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://jordaneldredge.com";
  const vc = VC.forScripts();

  // Get all content (posts and notes)
  const allContent = Data.ContentConnection.all(vc, {
    sort: "latest",
    filters: ["showInLists"],
  });

  // Get all static pages
  const staticPages = Data.getAllPages();

  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/notes/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projects/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact/`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // Add all static pages
  for (const page of staticPages) {
    const slug = page.slug();
    sitemapEntries.push({
      url: `${baseUrl}/${slug}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  // Add all content (posts and notes)
  for (const content of allContent) {
    const url = content.url().fullyQualified();
    sitemapEntries.push({
      url,
      lastModified: content.dateObj(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  // Get all unique tags
  const tags = new Set<string>();
  for (const content of allContent) {
    const tagSet = content.tagSet();
    const tagStrings = tagSet.tags().map((tag) => tag.tag());
    for (const tag of tagStrings) {
      tags.add(tag);
    }
  }

  // Add tag pages
  for (const tag of tags) {
    sitemapEntries.push({
      url: `${baseUrl}/tag/${tag}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  return sitemapEntries;
}
