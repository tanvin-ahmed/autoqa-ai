# AutoQA AI

Automated QA tooling that connects to GitHub repositories, analyzes project context with **Google Gemini**, and suggests **hosted browser test runs** (Playwright against your app URLs via **Browserless**). Credits track AI and hosted-browser usage; **Stripe** can be used for billing and subscriptions.

---

## Overview

AutoQA AI is a **Next.js** full-stack application. Users authenticate with **Clerk**, link **GitHub** via OAuth so the backend can read repository metadata and file contents where needed, then use a **workspace** to manage connected repos, domains, AI-generated **test cases**, and **execution reports** stored in **Neon PostgreSQL**.

The workflow is geared toward generating structured test scenarios from real codebases, iterating on scripts, and running them in disposable cloud browsers without installing Chrome or Playwright locally.

---

## Features

- **Authentication & profiles** — Sign-in/up with Clerk; workspace state tied to a persisted app user (`users` row in Postgres).
- **GitHub integration** — OAuth-backed connection; repositories are listed and persisted for the workspace.
- **Repository & domain settings** — Configure target URLs and project-level instructions feeding test generation or runs.
- **AI test-case generation** — Calls Gemini against repo context (files, routing hints) to produce structured test cases (title, description, type, priority, routes, file context JSON).
- **Hosted browser runner** — Optional cached or regenerated automation scripts executed with **Playwright** over CDP attached to **Browserless** (`/api/test-cases/run`): logs and pass/fail status stored on test cases.
- **Credit metering** — Usage-based debits around Gemini tokens and approximate Browserless wall time; surfaced in the workspace UI with guardrails before expensive operations.
- **Stripe billing** — Checkout, webhook-driven fulfillment/idempotency, customer portal linkage (Stripe customer stored on user where configured).
- **Marketing / support surfaces** — Landing, pricing/support pages as shipped in-app.

---

## Technologies

| Area | Stack |
| --- | --- |
| **Framework** | Next.js (App Router), React 19, TypeScript |
| **UI** | Tailwind CSS, Radix primitives, lucide-react, Sonner (toasts) |
| **Auth** | Clerk (`@clerk/nextjs`) |
| **Database** | Neon Postgres + Drizzle ORM (`drizzle-orm`, `@neondatabase/serverless`) |
| **AI** | `@google/genai` (Gemini) for suites and automation script regeneration |
| **Hosting browser / automation** | `playwright-core` + outbound WebSockets to Browserless |
| **Payments** | Stripe (server APIs + Stripe.js on the client where used) |
| **HTTP client** | axios |
| **GitHub** | OAuth callbacks and GitHub REST for repo/token flows |
| **Tooling** | ESLint (`eslint-config-next`), drizzle-kit, pnpm |

Configuration reference: **`.env.example`**.

---

## SEO (built-in)

- **`NEXT_PUBLIC_APP_URL`** should be your **deployed origin** (e.g. production Vercel URL). It powers canonical URLs, Open Graph `metadataBase`, `/sitemap.xml`, `/robots.txt`, and JSON-LD `@id` values.
- Dynamic **social previews**: `app/opengraph-image.tsx`, `app/twitter-image.tsx` (Open Graph + Twitter `summary_large_image`).
- **`app/manifest.ts`** serves a web app manifest for install UX.
- **JSON-LD**: Organization + WebSite on every page; the homepage adds **SoftwareApplication** + **FAQPage** (see `lib/seo/json-ld.ts` and `lib/marketing/faq-content.ts`).
- **Indexing**: Workspace and Clerk auth pages use **`noindex`**; `robots.txt` also disallows `/api/*`.
- Optional: **`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`**, **`NEXT_PUBLIC_TWITTER_SITE`** in `.env`.

---

## Local development

```bash
pnpm install
cp .env.example .env
# Fill .env with real keys (Clerk, Neon, Gemini, Browserless, GitHub, Stripe, etc.)
pnpm dev
```

Schema sync (`db/schema.ts` vs Neon):

```bash
pnpm db:push
# or apply SQL migrations under db/migrations/
```

---

> **Note — Vercel Hobby and hosted test runs**  
> On your laptop, **`pnpm dev`** keeps a **long-lived Node process**, so **`POST /api/test-cases/run`** can spend as long as it needs talking to Gemini, opening a **Browserless CDP WebSocket**, and executing Playwright.  
>  
> **Vercel Hobby** serves each API route as a **short-lived serverless invocation** with a **maximum wall-clock time per request** (on the order of **~60 seconds** when explicitly configured via `maxDuration` in `app/api/test-cases/run/route.ts`; **default** timeouts are shorter). Hosted runs that overshoot this budget are **terminated by the platform**, which commonly surfaces as **500** or gateway errors even though the **same deployment logic works locally**.  
>  
> **Mitigations:** keep runs under Hobby’s ceiling, raise `maxDuration` on a plan that supports **longer executions** (e.g. **Vercel Pro** allows higher limits), offload long runner work to an external worker, or run tests locally/self-hosted Node. Missing **Production** env vars (**`GEMINI_API_KEY`**, **`BROWSERLESS_*`**, **`DATABASE_URL`**, etc.) or a **mis-migrated Neon schema** also fail only after deploy—investigate the response body in the browser **Network** tab for JSON `error` details.
