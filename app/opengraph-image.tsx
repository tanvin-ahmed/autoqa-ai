import { ImageResponse } from "next/og";

import {
  SITE_BRAND_TITLE,
  SITE_SHORT_NAME,
  ogTaglineSnippet,
} from "@/lib/seo/site";

export const runtime = "edge";

export const alt = `${SITE_SHORT_NAME} — AI-assisted test automation`;

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "72px 80px",
          background:
            "linear-gradient(132deg, #1e1b4b 0%, #4338ca 42%, #0f172a 100%)",
          color: "#f8fafc",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            opacity: 0.85,
            marginBottom: 16,
            color: "#a5b4fc",
          }}
        >
          {SITE_BRAND_TITLE}
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.12,
            maxWidth: 960,
          }}
        >
          {SITE_SHORT_NAME}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 21,
            lineHeight: 1.45,
            maxWidth: 980,
            color: "#cbd5f5",
            opacity: 0.95,
          }}
        >
          {ogTaglineSnippet()}
        </div>
      </div>
    ),
    { ...size },
  );
}
