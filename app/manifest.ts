import type { MetadataRoute } from "next";

import { SITE_DESCRIPTION_LONG, SITE_SHORT_NAME } from "@/lib/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: SITE_SHORT_NAME,
    short_name: SITE_SHORT_NAME,
    description: SITE_DESCRIPTION_LONG.slice(0, 260),
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6366f1",
    icons: [
      {
        src: "/logo.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
    ],
  };
}
