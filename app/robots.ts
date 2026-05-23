import type { MetadataRoute } from "next";

import { getSiteOrigin } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/workspace"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
