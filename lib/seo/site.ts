/** Public site URL — must match canonical host in production (`NEXT_PUBLIC_APP_URL`). */

const DEFAULT_FALLBACK_ORIGIN = "http://localhost:3000";

export const SITE_SHORT_NAME = "Auto QA AI";
export const SITE_BRAND_TITLE = "Auto QA";
export const SITE_TAGLINE =
  "AI-assisted test automation for JavaScript & TypeScript (MERN-ready) repos—GitHub-connected generation and hosted Browserless runs.";
export const SITE_DESCRIPTION_LONG =
  "Connect GitHub to Auto QA AI. Draft reviewable test cases with Gemini, align with Vitest / Jest / Playwright / Cypress patterns, and run scenarios in disposable cloud browsers. JS & TS only.";

/** Primary keywords for `<meta name="keywords">` (marketing pages). */
export const SITE_KEYWORDS = [
  "AI test automation",
  "GitHub QA",
  "JavaScript testing",
  "TypeScript testing",
  "MERN stack testing",
  "AI test generation",
  "Playwright cloud",
  "Browserless",
  "automated QA",
  "Vitest",
  "Jest",
  "Cypress",
  "deterministic assertions",
].join(", ");

export function getSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "") ?? "";
  const candidate = raw.startsWith("http") ? raw : "";

  try {
    if (candidate) return new URL(candidate).origin.replace(/\/+$/, "");
  } catch {
    /* ignore bad env */
  }
  return DEFAULT_FALLBACK_ORIGIN;
}

export function getMetadataBaseUrl(): URL {
  try {
    return new URL(getSiteOrigin());
  } catch {
    return new URL(DEFAULT_FALLBACK_ORIGIN);
  }
}

export function absoluteUrl(pathname: string): string {
  const base = getSiteOrigin();
  if (!pathname || pathname === "/") return base;
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${p}`;
}

/** e.g. `NEXT_PUBLIC_TWITTER_SITE=autoqa_ai` → `@autoqa_ai` for Twitter/X cards */
export function getTwitterSiteHandle(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_TWITTER_SITE?.trim();
  if (!raw) return undefined;
  return raw.startsWith("@") ? raw : `@${raw}`;
}

/** Trimmed OG line so the default 1200×630 image stays readable */
export function ogTaglineSnippet(maxChars = 168): string {
  const s = SITE_TAGLINE.trim();
  if (s.length <= maxChars) return s;
  return `${s.slice(0, Math.max(0, maxChars - 1)).trim()}…`;
}
