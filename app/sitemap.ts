import type { MetadataRoute } from "next";

import { getSiteOrigin } from "@/lib/seo/site";

/** Public indexable URLs only — auth/workspace intentionally omitted. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteOrigin();
  const now = new Date();

  const routes = [
    { path: "/", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/pricing", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/support", changeFrequency: "monthly" as const, priority: 0.75 },
  ];

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: path === "/" ? base : `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
