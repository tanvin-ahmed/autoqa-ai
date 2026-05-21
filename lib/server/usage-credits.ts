/** Credit formulas from Gemini `usageMetadata` + Browserless wall time. */

export type GeminiTokenUsage = {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
};

function envInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw === "") return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

function envFloat(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw === "") return fallback;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

/** Rough heuristic when the SDK omits token counts (~4 chars per token). */
export function estimateTokensFromChars(chars: number): number {
  const n = Number.isFinite(chars) ? chars : 0;
  return Math.max(0, Math.ceil(n / 4));
}

/** Parse usage from `@google/genai` `generateContent` response (camelCase or snake_case). */
export function extractGeminiUsageFromResponse(response: unknown): GeminiTokenUsage {
  let prompt = 0;
  let cand = 0;
  let total = 0;

  if (response !== null && typeof response === "object") {
    const meta =
      Reflect.get(response as object, "usageMetadata") ??
      Reflect.get(response as object, "usage_metadata");

    if (meta !== null && typeof meta === "object") {
      const m = meta as Record<string, unknown>;
      const pTok = m.promptTokenCount ?? m.prompt_token_count;
      const cTok =
        m.candidatesTokenCount ??
        m.candidates_token_count ??
        m.candidatesTokens;
      const tTok = m.totalTokenCount ?? m.total_token_count;

      prompt = typeof pTok === "number" ? pTok : Number(pTok ?? 0) || 0;
      cand = typeof cTok === "number" ? cTok : Number(cTok ?? 0) || 0;
      total = typeof tTok === "number" ? tTok : Number(tTok ?? 0) || 0;
    }
  }

  if (total <= 0) {
    total = Math.max(0, prompt + cand);
  }

  return {
    promptTokenCount: Math.max(0, prompt),
    candidatesTokenCount: Math.max(0, cand),
    totalTokenCount: Math.max(0, total),
  };
}

/**
 * Credits for a Gemini call from prompt + completion token counts (metering rules only).
 */
export function creditsForGeminiTokenCounts(
  promptTokens: number,
  completionTokens: number,
): number {
  const perMp = envInt("CREDITS_PER_MILLION_PROMPT_TOKENS", 5_000);
  const perMc = envInt("CREDITS_PER_MILLION_RESPONSE_TOKENS", 15_000);
  const minCall = envInt("CREDITS_GEMINI_MIN_PER_CALL", 2);
  const maxCall = envInt("CREDITS_GEMINI_MAX_PER_CALL", 2_500);

  const pt = Number.isFinite(promptTokens) ? Math.max(0, promptTokens) : 0;
  const ct =
    Number.isFinite(completionTokens) ? Math.max(0, completionTokens) : 0;

  const raw = Math.ceil((pt / 1_000_000) * perMp + (ct / 1_000_000) * perMc);

  let n = Math.max(minCall, raw);
  if (maxCall > 0 && n > maxCall) {
    n = maxCall;
  }
  return n;
}

/** Derive billed completion tokens when `candidatesTokenCount` is zero (SDK quirks). */
function resolveCompletionTokens(
  usage: GeminiTokenUsage,
  promptKnownForTotal: number,
  fallbackCompletionCharsFromText: number,
): number {
  let c = usage.candidatesTokenCount;

  const total = usage.totalTokenCount;

  const prompt = usage.promptTokenCount || promptKnownForTotal;

  const impliedFromTotal = total > 0 && total >= prompt ? total - prompt : 0;

  if (impliedFromTotal > 0) {
    c = Math.max(c, impliedFromTotal);
  }

  if (c > 0) return c;

  return estimateTokensFromChars(fallbackCompletionCharsFromText);
}

/**
 * Credits to charge using SDK usage, with char-based fallbacks for missing counts.
 *
 * `fallbackPromptChars` / `fallbackOutputChars` approximate tokens when counts are omitted.
 */
export function creditsFromMeasuredGemini(
  usage: GeminiTokenUsage,
  fallbackPromptChars: number,
  fallbackOutputChars: number,
): number {
  const p =
    usage.promptTokenCount > 0
      ? usage.promptTokenCount
      : estimateTokensFromChars(fallbackPromptChars);

  const c = resolveCompletionTokens(usage, p, fallbackOutputChars);

  return creditsForGeminiTokenCounts(p, c);
}

/** Conservative credits needed before calling Gemini (avoids unpaid API burns). */
export function estimateCreditsBeforeGeminiCall(
  estimatedPromptChars: number,
  assumedMaxOutputTokens: number,
): number {
  const pTok = estimateTokensFromChars(estimatedPromptChars);
  return creditsForGeminiTokenCounts(pTok, assumedMaxOutputTokens);
}

/** Hosted browser billing from wall-clock seconds attached to Browserless/CDP session. */
export function creditsForBrowserlessWallSeconds(wallSeconds: number): number {
  const base = envFloat("CREDITS_BROWSERLESS_BASE", 8);
  const perSec = envFloat("CREDITS_BROWSERLESS_PER_SECOND", 0.15);
  const minCredits = envInt("CREDITS_BROWSERLESS_MIN", 10);
  const maxSession = envInt("CREDITS_BROWSERLESS_MAX_PER_SESSION", 0);

  const minBillSeconds = envFloat("CREDITS_BROWSERLESS_MIN_BILL_SECONDS", 1);
  const secs = Math.max(minBillSeconds, Number.isFinite(wallSeconds) ? wallSeconds : 0);

  const raw = base + secs * perSec;

  let n = Math.max(minCredits, Math.ceil(raw));

  if (maxSession > 0 && n > maxSession) {
    n = maxSession;
  }
  return n;
}

/** Minimum credits to allow starting a Browserless session (worst-case short session). */
export function peekMinCreditsForBrowserlessSession(): number {
  const minSecs = envFloat("CREDITS_BROWSERLESS_MIN_BILL_SECONDS", 1);
  return creditsForBrowserlessWallSeconds(minSecs);
}
