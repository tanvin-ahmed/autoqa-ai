import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Braces,
  CheckCircle2,
  CircleDot,
  Cpu,
  FlaskConical,
  Gauge,
  GitBranch,
  PlayCircle,
  Sparkles,
  TestTube2,
} from "lucide-react";

import { LandingFAQ } from "@/components/custom/marketing/LandingFAQ";
import { PageContainer } from "@/components/custom/share/page-container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Auto QA — Futuristic reliability lab for JS & TS repos",
  description:
    "JavaScript & TypeScript projects only—including typical MERN stacks. AI-assisted test generation, deterministic runners, assertions in view—Vitest, Jest, Playwright, Cypress.",
};

const workflowSteps = [
  {
    title: "Bind repository ingress",
    copy: "Scoped GitHub OAuth. Select the codebase your suite should trace—we keep tokens constrained while manifest mining begins.",
    icon: GitBranch,
  },
  {
    title: "Parse runner topology",
    copy: "Inspect scripts, manifests, and npm-native runners (Vitest/Jest/etc.) inside JS/TS and MERN-style apps—nothing synthetic about the wiring.",
    icon: Braces,
  },
  {
    title: "Project scenarios + assertions",
    copy: "LLM-guided specs stay anchored to repo paths—reviewers see intent, prerequisites, and expected signals before approving execution.",
    icon: Sparkles,
  },
  {
    title: "Execute + stream signals",
    copy: "Surface pass, skip, and failure signals in the workspace before you hoist the same assertions into hardened CI lanes.",
    icon: PlayCircle,
  },
] as const;

const featureTiles = [
  {
    eyebrow: "RUNTIME_FOCUS",
    title: "MERN + npm natives only",
    subtitle: "Vitest · Jest · Playwright · Cypress · wire harness",
    body: "JavaScript / TypeScript codebases—including MongoDB · Express · React · Node patterns—meet the toolchain this lab understands.",
    icon: TestTube2,
    className: "sm:col-span-5",
  },
  {
    eyebrow: "CONTROL_SURFACE",
    title: "Credits, repos, flaky watch",
    subtitle: "One cockpit—not a labyrinth of spreadsheets",
    body: "Track generation bursts, rerun cadence, and remaining credits beside the repos that actually shipped last night.",
    icon: Cpu,
    className: "sm:col-span-7",
  },
  {
    eyebrow: "EVIDENCE_MODE",
    title: "Traceable assertions—not vibes",
    subtitle: "Each case cites where it anchored",
    body: "Engineers reconcile AI output against concrete modules so QA reviewers debate evidence, not black-box optimism.",
    icon: Gauge,
    className: "sm:col-span-7",
  },
  {
    eyebrow: "TELEMETRY_SKIN",
    title: "High-signal HUD that respects calm mode",
    subtitle: "Scanlines shimmer only when motion is allowed",
    body: "We lean on glass telemetry, monospace readouts, and neon edges when you enable motion.",
    icon: FlaskConical,
    className: "sm:col-span-5",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <main id="main-content">
        {/* Hero */}
        <section className="relative isolate overflow-hidden border-b border-primary/25 bg-muted/25 dark:border-primary/20 dark:bg-muted/60">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(129,119,239,0.38),transparent_55%),radial-gradient(ellipse_90%_60%_at_100%_40%,rgba(56,189,248,0.22),transparent_50%),radial-gradient(ellipse_70%_50%_at_0%_80%,rgba(34,211,238,0.15),transparent_45%),radial-gradient(ellipse_50%_40%_at_80%_110%,rgba(52,211,153,0.16),transparent_45%)] dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(129,119,239,0.52),transparent_50%),radial-gradient(ellipse_90%_60%_at_100%_40%,rgba(56,189,248,0.28),transparent_46%),radial-gradient(ellipse_70%_50%_at_0%_80%,rgba(34,211,238,0.22),transparent_42%),radial-gradient(ellipse_50%_42%_at_82%_108%,rgba(52,211,153,0.22),transparent_43%)]"
          />

          <div
            aria-hidden
            className="landing-grid-shift pointer-events-none absolute inset-x-0 top-24 -z-10 h-[22rem] bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_70%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_70%,transparent)_1px,transparent_1px)] bg-[length:56px_56px] opacity-[0.22] motion-safe:[mask-image:radial-gradient(65%_60%_at_50%_15%,black,transparent)]"
          />

          <div
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
            aria-hidden
          >
            <div className="landing-scanline absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-b from-transparent via-cyan-500/55 to-transparent dark:via-cyan-400/45" />
          </div>

          <PageContainer className="relative z-10 py-14 sm:py-20 lg:py-[5.75rem]">
            <span
              aria-hidden
              className="landing-corner-box left-4 top-[4.75rem] hidden rounded-ss-sm border-l-2 border-t-2 lg:block xl:left-[calc(max(1rem,(100vw-72rem)/2))]"
            />
            <span
              aria-hidden
              className="landing-corner-box right-4 top-[4.75rem] hidden rounded-se-sm border-r-2 border-t-2 lg:block xl:right-[calc(max(1rem,(100vw-72rem)/2))]"
            />
            <span
              aria-hidden
              className="landing-corner-box bottom-[4rem] left-4 hidden rounded-es-sm border-b-2 border-l-2 lg:block xl:left-[calc(max(1rem,(100vw-72rem)/2))]"
            />
            <span
              aria-hidden
              className="landing-corner-box bottom-[4rem] right-4 hidden rounded-ee-sm border-b-2 border-r-2 lg:block xl:right-[calc(max(1rem,(100vw-72rem)/2))]"
            />

            <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 lg:items-start">
              <div className="space-y-7 lg:mt-6">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <p className="landing-chip-glow inline-flex items-center rounded-full border border-primary/35 bg-background/80 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-primary shadow-[0_0_20px_-6px_color-mix(in_oklch,var(--primary)_60%,transparent)] backdrop-blur-sm">
                    {"// AUTOQA_LAB"}
                  </p>
                  <span className="inline-flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                    <span className="landing-live-dot" aria-hidden />
                    RUN_FEED · LIVE
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    CLOCK{" "}
                    <span className="tabular-nums text-foreground">T+000</span>
                  </span>
                </div>

                <div className="space-y-5">
                  <h1 className="text-pretty font-semibold tracking-tight text-[clamp(2.1rem,5.8vw,3.65rem)] leading-[1.04]">
                    A{" "}
                    <span className="relative inline-flex items-baseline whitespace-nowrap">
                      testing observatory{" "}
                      <Activity className="ml-1 inline h-[0.72em] w-[0.72em] -translate-y-px text-emerald-500 motion-safe:animate-pulse dark:text-emerald-400" />
                    </span>{" "}
                    for assertions that refuse to hallucinate{" "}
                    <span className="bg-gradient-to-r from-primary via-cyan-500 to-emerald-500 bg-clip-text text-transparent dark:from-primary dark:via-cyan-300 dark:to-emerald-300">
                      your suite
                    </span>
                  </h1>

                  <p className="max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
                    Telemetry-first QA: scaffold scenarios, tighten assertions, and watch signals stream like a futuristic runner HUD—paired with deterministic engines you trust.
                  </p>

                  <div
                    role="region"
                    aria-label="Which projects Auto QA supports"
                    className="max-w-2xl rounded-lg border border-amber-500/40 bg-gradient-to-br from-amber-500/[0.12] to-transparent px-4 py-3 text-sm leading-relaxed shadow-[inset_0_1px_0_0_rgb(251_191_36_/_0.16)] backdrop-blur-sm dark:border-amber-400/35 dark:from-amber-400/[0.12]"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-700/90 dark:text-amber-300/95">
                      SCOPE_GUARD
                    </p>
                    <p className="mt-2 text-foreground">
                      <strong className="font-semibold">Eligible stacks:</strong>{" "}
                      <strong className="font-semibold">JavaScript + TypeScript</strong> repos (incl.
                      typical <abbr title="MongoDB, Express, React, Node.js" className="cursor-help no-underline">MERN</abbr>
                      architectures). Languages outside JS/TS are not routed through this observatory yet.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button asChild size="lg" className="gap-2 shadow-[0_0_28px_-8px_color-mix(in_oklch,var(--primary)_75%,transparent)]">
                    <Link href="/sign-up">
                      Initialize workspace
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="font-mono">
                    <Link href="/workspace">
                      /workspace_console
                      <span className="sr-only">Open workspace dashboard</span>
                    </Link>
                  </Button>
                </div>

                <nav
                  aria-label="On-page shortcuts"
                  className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs font-medium"
                >
                  <Link
                    href="/pricing"
                    className="text-muted-foreground underline-offset-[5px] transition-colors hover:text-foreground hover:underline"
                  >
                    ::pricing_specs
                  </Link>
                  <Link
                    href="/support"
                    className="text-muted-foreground underline-offset-[5px] transition-colors hover:text-foreground hover:underline"
                  >
                    ::support_wire
                  </Link>
                  <Link
                    href="#workflow"
                    className="text-muted-foreground underline-offset-[5px] transition-colors hover:text-foreground hover:underline motion-reduce:transition-none"
                  >
                    ::orchestration_map
                  </Link>
                </nav>
              </div>

              <div className="relative lg:min-h-[28rem]" aria-labelledby="landing-hud-title">
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-[42%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_120deg,var(--primary),transparent,cyan,var(--primary))] opacity-25 blur-[90px] motion-safe:landing-orbit-ring dark:opacity-[0.38]"
                />
                <span id="landing-hud-title" className="sr-only">
                  Example suite telemetry visualization
                </span>

                <div className="relative z-[1] flex flex-col gap-4 lg:absolute lg:inset-x-0 lg:top-0">
                  <div className="landing-panel-shimmer landing-frame-pulse motion-safe:landing-float-slow overflow-hidden rounded-2xl border border-emerald-500/35 bg-card/93 font-mono shadow-[0_0_42px_-12px_rgba(16,185,129,0.35)] ring-1 ring-primary/25 backdrop-blur-xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-6 motion-safe:duration-700 lg:translate-x-[2%] dark:border-emerald-500/30 dark:bg-card/80 dark:shadow-emerald-500/20">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 bg-muted/55 px-4 py-2.5 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-2 uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                        RUN_ARCHIVE · OK
                      </span>
                      <span className="tabular-nums">AUTOQA · RUN 02F9C4BE</span>
                    </div>
                    <div className="relative space-y-4 p-4 sm:p-5">
                      <div className="flex flex-wrap gap-4 border-b border-dashed border-border/70 pb-4 text-[11px] text-muted-foreground">
                        <div className="min-w-[8rem]">
                          <span className="block text-[10px] uppercase tracking-wider">assertions</span>
                          <span className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                            142
                          </span>
                        </div>
                        <div className="min-w-[8rem]">
                          <span className="block text-[10px] uppercase tracking-wider">flakes_suppressed</span>
                          <span className="text-lg font-semibold tabular-nums text-primary">06</span>
                        </div>
                        <div className="flex min-w-[10rem] flex-1 flex-col gap-2">
                          <span className="text-[10px] uppercase tracking-wider">
                            throughput
                          </span>
                          <div className="h-2 rounded-full bg-muted">
                            <div className="h-full w-[88%] rounded-full bg-emerald-500/90 motion-safe:landing-runner-bar-fill shadow-[0_0_14px_-2px_rgba(16,185,129,0.55)] dark:bg-emerald-400/90" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/35 p-3 max-sm:flex-col">
                        <div className="relative h-[52px] w-[63px] shrink-0 rounded-md border bg-background p-2">
                          <Image
                            src="/logo.svg"
                            alt=""
                            width={47}
                            height={36}
                            className="h-9 w-auto"
                            priority
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            synthetic_monitor · ACTIVE
                          </p>
                          <p className="mt-1 text-sm font-sans font-semibold text-foreground">
                            Assertion graph mirrors repo truth
                          </p>
                          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                            Streams paths + runner metadata so QA can diff AI intent against deterministic output.
                          </p>
                        </div>
                      </div>

                      <ul className="grid gap-2 rounded-lg border border-border/60 bg-background/70 p-3 text-[11px] leading-snug backdrop-blur-sm">
                        <li className="flex gap-2 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                          <span>
                            [PASS] <span className="font-mono">auth/session.spec.tsx</span> — token parity
                          </span>
                        </li>
                        <li className="flex gap-2 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                          <span>
                            [PASS] <span className="font-mono">checkout.flow.test.ts</span> — cart rollback
                          </span>
                        </li>
                        <li className="flex gap-2 text-amber-600 dark:text-amber-400">
                          <CircleDot className="mt-0.5 h-3.5 w-3.5 shrink-0 fill-current" aria-hidden />
                          <span>
                            [SKIP] <span className="font-mono">infra/latency.e2e.ts</span> — sandbox offline
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-primary/35 bg-muted/40 px-4 py-3 text-[11px] font-medium text-muted-foreground shadow-lg backdrop-blur-md motion-safe:border-cyan-500/25 lg:translate-x-[6%] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-5 motion-safe:delay-200 motion-safe:duration-700 dark:bg-muted/55">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-400">
                      TRACE_DIGEST
                    </span>
                    <p className="mt-2 font-sans leading-relaxed">
                      Replay deterministic signals beside AI-authored narratives—elevate hardened suites straight into CI when governance gives the green blink.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* Integrations strip */}
        <section
          className="border-b border-primary/25 bg-gradient-to-br from-muted/80 via-muted/40 to-background py-10 dark:border-primary/20 dark:from-muted/90 dark:to-background"
          aria-labelledby="integrations-heading"
        >
          <PageContainer className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
                integration_mesh
              </p>
              <h2 id="integrations-heading" className="text-xl font-semibold tracking-tight">
                Git commits meet runner telemetry—JS lane only today
              </h2>
              <p className="text-sm text-muted-foreground">
                MERN and broader npm-era stacks ingest cleanly. JVM/Python/native stacks route elsewhere—tell us where you&apos;re migrating if you&apos;re bridging multi-language monoliths later.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider shadow-sm ring-1 ring-primary/25">
                <Gauge className="h-4 w-4 text-primary opacity-90" aria-hidden />
                npm · vite · playwright
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider shadow-sm">
                <Braces className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                JS · TS · MERN
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm">
                <GitBranch className="h-4 w-4 opacity-70" aria-hidden />
                GitHub OAuth ingress
              </span>
              <span className="rounded-md border border-dashed border-border/90 bg-muted/50 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                adaptersQueued …
              </span>
            </div>
          </PageContainer>
        </section>

        {/* Live telemetry ticker */}
        <section
          className="border-b border-border bg-background py-3 font-mono text-[11px]"
          aria-hidden
        >
          <PageContainer className="relative overflow-hidden py-2">
            <div className="landing-marquee-track">
              {[0, 1].map((dup) => (
                <span
                  key={dup}
                  className="inline-flex shrink-0 gap-14 whitespace-nowrap pr-14 text-muted-foreground"
                >
                  <span className="text-emerald-600 dark:text-emerald-400">ASSERT_OK · 982</span>
                  <span>TRACE_NODE · qa/app-router</span>
                  <span>RERUN_BURST · CREDITS_MONITOR</span>
                  <span className="text-amber-700 dark:text-amber-400">SKIP_WARN · flaky_guard</span>
                  <span>RUNNER_HOOK · playwright</span>
                  <span>SESSION · js/ts_lane</span>
                </span>
              ))}
            </div>
          </PageContainer>
        </section>

        {/* Features */}
        <section id="features" aria-labelledby="features-heading">
          <PageContainer className="py-20 sm:py-24">
            <div className="max-w-3xl space-y-3">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-primary">
                ::feature_matrix
              </p>
              <h2
                id="features-heading"
                className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                Synthetic intelligence, deterministic harness—a testing platform veneer
              </h2>
              <p className="text-muted-foreground sm:text-lg">
                The grid below mirrors observability ergonomics pulled from futuristic QA rigs: monochrome telemetry ribbons, monospace tags, emerald pass halos—all tuned for readability on light + dark hyperspace themes.
              </p>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-12">
              {featureTiles.map((tile) => {
                const Icon = tile.icon;
                return (
                  <article
                    key={tile.title}
                    className={`landing-panel-shimmer group relative overflow-hidden rounded-2xl border border-border/75 border-primary/25 bg-gradient-to-br from-card to-muted/45 bg-card/93 p-6 shadow-[0_22px_50px_-32px_rgb(79_70_229_/_0.35)] backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-700 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:hover:-translate-y-1 motion-safe:hover:border-primary/55 motion-safe:hover:shadow-[0_24px_60px_-30px_rgb(56_189_248_/_0.28)] sm:p-8 dark:shadow-[0_22px_50px_-32px_rgb(99_102_241_/_0.38)] dark:motion-safe:hover:shadow-[0_24px_60px_-30px_rgb(34_211_238_/_0.35)] ${tile.className}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          {tile.eyebrow}
                        </p>
                        <h3 className="mt-2 font-sans text-xl font-semibold leading-snug tracking-tight">
                          {tile.title}
                        </h3>
                        <p className="mt-1 font-mono text-[11px] text-primary/95 dark:text-cyan-300/90">
                          {tile.subtitle}
                        </p>
                        <p className="mt-3 font-sans leading-relaxed text-muted-foreground">
                          {tile.body}
                        </p>
                      </div>
                      <div className="shrink-0 rounded-xl border border-primary/35 bg-muted/65 p-2.5 text-primary shadow-inner ring-1 ring-cyan-500/25 dark:ring-cyan-400/35">
                        <Icon className="h-6 w-6 transition-transform duration-700 motion-safe:group-hover:scale-105 motion-safe:group-hover:text-cyan-500 dark:motion-safe:group-hover:text-cyan-300" aria-hidden />
                      </div>
                    </div>
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/65 to-transparent opacity-85 dark:via-cyan-400/70"
                    />
                  </article>
                );
              })}
            </div>
          </PageContainer>
        </section>

        {/* Workflow */}
        <section
          id="workflow"
          aria-labelledby="workflow-heading"
          className="relative border-y border-border bg-muted/35 dark:bg-muted/65"
        >
          <PageContainer className="py-20 sm:py-24">
            <div className="max-w-3xl space-y-3">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-primary">
                ::orchestration
              </p>
              <h2
                id="workflow-heading"
                className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                Commit → ingest → propagate assertions → certify release pulses
              </h2>
              <p className="text-muted-foreground sm:text-lg">
                Reversible checkpoints let humans gate anything heading near prod—signals stay luminous on the HUD while you tighten coverage depth.
              </p>
            </div>

            <ol className="mt-14 grid gap-8 lg:grid-cols-4">
              {workflowSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <li
                    key={step.title}
                    className="group relative rounded-2xl border border-border/70 border-l-[3px] border-l-emerald-500/65 bg-gradient-to-br from-background to-muted/65 p-6 shadow-inner backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 motion-safe:duration-500 motion-safe:hover:border-primary/65 motion-safe:hover:border-l-emerald-400 dark:to-muted/90"
                    style={{
                      animationDelay: `${Math.min(idx, 7) * 95}ms`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-md bg-gradient-to-br from-primary to-purple-900/95 font-mono text-sm font-semibold tracking-tighter text-primary-foreground shadow-inner dark:from-primary dark:to-purple-950/90 dark:text-primary-foreground">
                        {(idx + 1).toString().padStart(2, "0")}
                      </span>
                      <Icon className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.copy}</p>
                  </li>
                );
              })}
            </ol>

            <div className="mt-14 rounded-2xl border border-primary/55 bg-gradient-to-br from-primary/25 via-muted/85 to-muted/40 p-[1px] shadow-[0_28px_60px_-32px_rgb(59_130_246_/_0.45)] dark:from-primary/35 dark:to-background dark:shadow-[0_28px_60px_-32px_rgb(34_211_238_/_0.42)] motion-safe:border-cyan-500/55">
              <div className="relative flex flex-col gap-6 overflow-hidden rounded-[calc(1rem-1px)] bg-background/93 p-8 sm:flex-row sm:items-center sm:justify-between motion-safe:bg-gradient-to-r motion-safe:from-background motion-safe:via-muted/40 motion-safe:to-background dark:bg-background/90">
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
                  <p>handshake_gate</p>
                  <p className="mt-4 font-sans text-2xl font-semibold tracking-tight text-foreground">
                    Pair stochastic LLM bursts with brittle-safe runners.
                  </p>
                </div>
                <Button asChild size="lg" className="shrink-0 font-mono">
                  <Link href="/sign-up">enqueue_workspace</Link>
                </Button>
              </div>
            </div>
          </PageContainer>
        </section>

        <LandingFAQ />
      </main>

      <footer className="border-t border-primary/35 bg-muted/25 dark:border-primary/30 dark:bg-muted/60">
        <PageContainer className="flex flex-col gap-10 py-16 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm space-y-3">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="" width={40} height={31} className="h-8 w-auto" />
              <span className="text-lg font-semibold tracking-tight">Auto QA</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Next-gen QA lab for JS · TS · MERN: AI scaffolding, deterministic runners,
              emerald pass pulses on the HUD.
            </p>
          </div>
          <nav aria-label="Footer" className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Navigate
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link
                    href="/workspace"
                    className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Workspace
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Sessions
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link
                    href="/sign-in"
                    className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sign-up"
                    className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Create account
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </PageContainer>
        <div className="border-t border-border/80 bg-background/95 py-6 text-center text-xs font-mono text-muted-foreground">
          © {new Date().getFullYear()} AUTO_QA // SIGNAL_STABLE · JS_TS_LANE_ONLY
        </div>
      </footer>
    </>
  );
}
