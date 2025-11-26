import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/paste/create/", "/paste/edit/"],
      },
    ],
    sitemap: "https://jordaneldredge.com/sitemap.xml",
  };
}
