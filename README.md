# AutoQA AI

Workspace for AI-assisted QA: GitHub-connected repos, generated test cases, and hosted-browser runs via Browserless.

## Deploying on Vercel

Local runs succeed while production returns **500** on `POST /api/test-cases/run` when:

1. **Function timeout** — The route connects to Browserless, runs Gemini (when regenerating a script), and executes Playwright. That almost always exceeds Vercel’s **default (~10–15 s)** unless you extend the route.  
   This repo exports **`maxDuration = 60`** and **`runtime = "nodejs"`** on `app/api/test-cases/run/route.ts`. Hobby is capped around **60 s** when configured; upgrade to **Pro** and raise `maxDuration` (e.g. **300**) if suites often exceed a minute.

2. **Missing environment variables** — In Vercel → **Project → Settings → Environment Variables**, set the same values as `.env.example`, especially **`GEMINI_API_KEY`**, **`BROWSERLESS_WS_ENDPOINT`**, **`BROWSERLESS_TOKEN`**, **`DATABASE_URL`**, and Clerk/GitHub OAuth secrets.

3. **Database schema drift** — Production Neon must match `db/schema.ts`. If selects fail with “column … does not exist”, run `db/migrations/001_stripe_billing.sql` in Neon SQL (or `pnpm drizzle-kit push`).

4. **OAuth URLs** — Register your production **`https://…`** in the GitHub App and Clerk; set **`GITHUB_REDIRECT_URI`** and **`NEXT_PUBLIC_APP_URL`** accordingly.

Redeploy after changing env vars. To see the precise error body, open the failing request in the browser **Network** tab (response JSON).
