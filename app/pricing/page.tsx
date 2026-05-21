import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";

import PricingFlashMessages from "@/components/custom/pricing/PricingFlashMessages";
import SubscribeProButton from "@/components/custom/pricing/SubscribeProButton";
import { PageContainer } from "@/components/custom/share/page-container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Auto QA pricing: free trial with 1,000 tokens, $30/mo Pro with monthly tokens, Enterprise via our team.",
};

const tiers = [
  {
    code: "PLAN :: TRIAL_RUN",
    name: "Free trial",
    price: "$0",
    tokens: "1,000 tokens free",
    tokensDetail: "One-time allotment to explore generation and hosted runs.",
    blurb:
      "Spin up Auto QA with GitHub-connected workspace access—perfect for validating the JS/TS + MERN workflow before committing budget.",
    bullets: [
      "Full workspace: repos, suites, executions (within quota)",
      "JavaScript · TypeScript · MERN-compatible repos only",
      "OAuth-scoped GitHub linking",
    ],
    cta: { href: "/sign-up", label: "Start free trial" },
    highlight: false,
    accent: "slate" as const,
  },
  {
    code: "PLAN :: PRO_BURST",
    name: "Pro",
    price: "$30",
    billing: "/month",
    tokens: "10,000 tokens / month",
    tokensDetail: "Quota refreshes each billing cycle.",
    blurb:
      "For builders and squads iterating weekly on AI-authored scenarios, reruns, and traceable assertions inside the workspace.",
    bullets: [
      "10× monthly headroom versus free trial allotment",
      "Priority-fit for recurring generation + execution bursts",
      "Powered by Stripe Checkout — monthly quota renews each paid invoice",
    ],
    cta: { href: "/sign-up", label: "Subscribe · $30/mo" },
    highlight: true,
    accent: "core" as const,
  },
  {
    code: "PLAN :: ENTERPRISE_LINK",
    name: "Enterprise",
    price: "Custom",
    tokens: "Volume + governance",
    tokensDetail: "Negotiated token pools, SLAs, and procurement-friendly terms.",
    blurb:
      "Dedicated rollout, SSO, contractual SLAs, and token economics aligned to your QA org.",
    bullets: ["Custom token commitments", "Security & compliance pairing", "Success + integration support"],
    cta: { href: "/support", label: "Contact our team" },
    highlight: false,
    accent: "orbit" as const,
  },
] as const;

export default function PricingPage() {
  return (
    <main className="grow">
      <PageContainer className="py-12 sm:py-16">
        <Suspense fallback={null}>
          <PricingFlashMessages />
        </Suspense>
        <div className="max-w-2xl space-y-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-primary">
            ::pricing_signal
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight">
            Simple token ladders for QA velocity
          </h1>
          <p className="text-muted-foreground sm:text-lg">
            Every plan is scoped to JavaScript · TypeScript · MERN-style repositories. Tokens fuel AI generation and
            execution inside the workspace—start with{" "}
            <strong className="font-medium text-foreground">1,000 free</strong>, scale on{" "}
            <strong className="font-medium text-foreground">$30/mo</strong>, or tailor volume with Enterprise.
          </p>
        </div>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                "relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card/90 text-card-foreground shadow-[0_28px_60px_-36px_rgb(79_70_229_/_0.55)] backdrop-blur-md transition-[box-shadow,border-color,transform] duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_32px_70px_-32px_rgb(99_102_241_/_0.42)] dark:bg-card/80 dark:shadow-[0_28px_60px_-36px_rgb(99_102_241_/_0.45)]",
                tier.accent === "slate" &&
                  "border-indigo-200/55 border-l-[3px] border-l-indigo-500/65 dark:border-indigo-500/35 dark:border-l-indigo-400/65",
                tier.accent === "core" &&
                  "border-indigo-300/65 border-l-[3px] border-l-indigo-600/90 ring-1 ring-indigo-400/35 ring-offset-2 ring-offset-background dark:border-indigo-500/55 dark:border-l-indigo-400/95 dark:ring-indigo-500/40",
                tier.accent === "orbit" &&
                  "border-indigo-300/55 border-l-[3px] border-l-indigo-700/75 dark:border-indigo-500/40 dark:border-l-indigo-300/65",
                tier.highlight &&
                  "border-indigo-400/65 bg-gradient-to-b from-primary/[0.14] via-card/95 to-card shadow-[0_32px_80px_-28px_rgb(99_102_241_/_0.48)] dark:from-primary/20 dark:border-indigo-500/50 dark:via-card/90 dark:to-card dark:shadow-[0_32px_80px_-28px_rgb(129_140_248_/_0.38)]",
              )}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_45%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_45%,transparent)_1px,transparent_1px)] bg-[length:24px_24px] opacity-[0.12]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/65 to-transparent dark:via-indigo-400/50"
              />

              <CardHeader className="relative z-10 flex flex-1 flex-col space-y-0 px-6 pb-4 pt-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/90 dark:text-indigo-300/90">
                  {tier.code}
                </p>
                <CardTitle className="mt-3 font-sans text-2xl tracking-tight">{tier.name}</CardTitle>

                <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-3xl font-semibold tabular-nums tracking-tight">{tier.price}</span>
                  {"billing" in tier && tier.billing ? (
                    <span className="font-mono text-sm text-muted-foreground">{tier.billing}</span>
                  ) : null}
                </div>

                <p className="mt-2 text-base font-semibold text-indigo-600 dark:text-indigo-300/95">{tier.tokens}</p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">{tier.tokensDetail}</p>

                <CardDescription className="mt-5 font-sans text-base leading-relaxed text-muted-foreground">
                  {tier.blurb}
                </CardDescription>

                <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-muted-foreground">
                  {tier.bullets.map((item, i) => (
                    <li key={`${tier.name}-${i}`} className="flex gap-2.5 leading-snug">
                      <CheckCircle2
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          tier.highlight
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-indigo-600/90 dark:text-indigo-400/90",
                        )}
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardHeader>

              <CardFooter className="relative z-10 mt-auto border-t border-border/70 bg-muted/35 px-6 py-5 backdrop-blur-sm dark:bg-muted/25">
                {tier.highlight ? (
                  <SubscribeProButton
                    variant="default"
                    className={cn(
                      "shadow-[0_12px_40px_-20px_rgb(79_70_229_/_0.6)] motion-safe:transition-transform motion-safe:active:translate-y-[1px]",
                      "bg-primary text-primary-foreground shadow-[0_16px_48px_-18px_rgb(99_102_241_/_0.52)] hover:bg-primary/90",
                    )}
                  />
                ) : (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className={cn(
                      "w-full font-mono text-sm tracking-wide shadow-[0_12px_40px_-20px_rgb(79_70_229_/_0.6)] motion-safe:transition-transform motion-safe:active:translate-y-[1px]",
                      "border-primary/35 bg-background/80 hover:border-primary/55 hover:bg-muted/60 dark:bg-card/70",
                    )}
                  >
                    <Link href={tier.cta.href}>{tier.cta.label}</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="mt-12 max-w-xl font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
          ENTERPRISE_CHANNEL →{" "}
          <Link className="normal-case tracking-normal underline underline-offset-4" href="/support">
            Support
          </Link>{" "}
          <span className="normal-case tracking-normal">&nbsp;• pooled tokens • SSO roadmap</span>
        </p>
      </PageContainer>
    </main>
  );
}
