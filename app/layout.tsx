import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";

import { AppShell } from "@/components/custom/AppShell";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { ThemeProvider } from "@/providers/theme-provider";
import { isClerkConfigured } from "@/lib/env/clerk";
import { buildSiteGraphLdJson } from "@/lib/seo/json-ld";
import {
  SITE_BRAND_TITLE,
  SITE_DESCRIPTION_LONG,
  SITE_KEYWORDS,
  SITE_SHORT_NAME,
  SITE_TAGLINE,
  getMetadataBaseUrl,
  getSiteOrigin,
  getTwitterSiteHandle,
} from "@/lib/seo/site";

import Provider from "./provider";
import { Toaster } from "@/components/ui/sonner";

const VERIFICATION_GOOGLE =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

const twitterSite = getTwitterSiteHandle();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: getMetadataBaseUrl(),
  ...(VERIFICATION_GOOGLE
    ? { verification: { google: VERIFICATION_GOOGLE } }
    : {}),
  title: {
    default: `${SITE_SHORT_NAME} · ${SITE_BRAND_TITLE}`,
    template: `%s · ${SITE_BRAND_TITLE}`,
  },
  description: SITE_DESCRIPTION_LONG,
  applicationName: SITE_SHORT_NAME,
  keywords: SITE_KEYWORDS.split(", "),
  authors: [{ name: SITE_SHORT_NAME, url: getSiteOrigin() }],
  creator: SITE_SHORT_NAME,
  publisher: SITE_SHORT_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  referrer: "strict-origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_BRAND_TITLE,
    title: `${SITE_SHORT_NAME} — AI-assisted test automation`,
    description: SITE_DESCRIPTION_LONG,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${SITE_SHORT_NAME} preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_SHORT_NAME} — QA automation for JS & TS`,
    description: SITE_TAGLINE,
    ...(twitterSite
      ? { site: twitterSite, creator: twitterSite }
      : {}),
    images: ["/twitter-image"],
  },
  category: "technology",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkAuthConfigured = isClerkConfigured();

  const shell = (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-dvh antialiased"
        style={{ margin: 0, padding: 0 }}
        suppressHydrationWarning
      >
        <JsonLdScript json={buildSiteGraphLdJson()} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Provider>
            <AppShell clerkAuthConfigured={clerkAuthConfigured}>
              {children}
            </AppShell>
          </Provider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );

  if (clerkAuthConfigured) {
    return <ClerkProvider>{shell}</ClerkProvider>;
  }

  return shell;
}
