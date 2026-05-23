import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "@/components/custom/share/page-container";
import { Button } from "@/components/ui/button";
import { SITE_KEYWORDS, SITE_SHORT_NAME } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Contact Auto QA AI for workspace, OAuth, Stripe billing, credits, or failing hosted runs — JavaScript and TypeScript (MERN) repos only.",
  keywords: SITE_KEYWORDS.split(", "),
  alternates: { canonical: "/support" },
  openGraph: {
    url: "/support",
    title: `${SITE_SHORT_NAME} — Support`,
    description:
      "Get help with Auto QA AI: GitHub connection, Clerk sign-in, credits, and QA automation.",
    type: "website",
  },
};

export default function SupportPage() {
  return (
    <main className="grow">
      <PageContainer className="max-w-xl py-12 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Support
        </h1>

        <p className="mt-4 text-muted-foreground">
          Email us—we read every message and reply fastest when you attach your GitHub org or repo
          name plus a quick note on what blocked you (OAuth, credits, failing run, etc.).
        </p>

        <p className="mt-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Repos we support:</span> JavaScript, TypeScript,
          and typical MERN apps only (not Python, JVM, etc.).
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button asChild size="lg">
            <a href="mailto:support@autoqa.ai">Email support@autoqa.ai</a>
          </Button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Replace{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[0.7rem] text-foreground">
            support@autoqa.ai
          </code>{" "}
          with your production address when routing is ready.
        </p>

        <nav
          aria-label="Support shortcuts"
          className="mt-10 flex flex-col gap-4 border-t border-border pt-8 text-sm sm:flex-row sm:gap-8"
        >
          <Link
            href="/#faq"
            className="text-primary underline underline-offset-4 hover:text-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Read FAQs on the homepage
          </Link>
          <Link
            href="/workspace"
            className="text-primary underline underline-offset-4 hover:text-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Open workspace
          </Link>
          <Link
            href="/pricing"
            className="text-primary underline underline-offset-4 hover:text-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Pricing
          </Link>
        </nav>
      </PageContainer>
    </main>
  );
}
