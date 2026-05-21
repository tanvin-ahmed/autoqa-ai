import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/db";
import {
  TestCasesTable,
  repositories,
  type Repository,
  type TestCase,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { chromium, type Browser } from "playwright-core";

import { consumeCreditsClamped } from "@/lib/server/credits";
import { getAuthenticatedDbUser } from "@/lib/server/db-user-auth";
import {
  creditsFromMeasuredGemini,
  creditsForBrowserlessWallSeconds,
  estimateCreditsBeforeGeminiCall,
  extractGeminiUsageFromResponse,
  peekMinCreditsForBrowserlessSession,
  type GeminiTokenUsage,
} from "@/lib/server/usage-credits";

/**
 * Hosted browser runs can exceed Vercel’s default ~10–15s function limit.
 * - Hobby (2025): capped at **60s** when `maxDuration` is set.
 * - Pro: increase toward **300** if tests often need longer Browserless sessions.
 */
export const maxDuration = 60;
/** Playwright connects over outbound WebSockets to Browserless — needs Node.js, not Edge. */
export const runtime = "nodejs";

let geminiSingleton: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Add it under Vercel → Project → Environment Variables.",
    );
  }
  geminiSingleton ??= new GoogleGenAI({ apiKey: key });
  return geminiSingleton;
}

/**
 * Build WebSocket CDP URL for Playwright chromium.connectOverCDP.
 * @see https://docs.browserless.io/baas/quick-start
 *
 * Env: BROWSERLESS_WS_ENDPOINT + BROWSERLESS_TOKEN.
 */
function resolveBrowserlessConnectUrl(): string {
  const raw =
    process.env.BROWSERLESS_WS_ENDPOINT?.trim().replace(/\/+$/, "") ?? "";
  if (!raw) {
    throw new Error("BROWSERLESS_WS_ENDPOINT is required.");
  }

  let endpoint = raw;
  if (!/^wss?:\/\//i.test(endpoint)) {
    const local =
      /^(localhost|127\.|0\.0\.0\.0|\[::1\])/i.test(endpoint) ||
      endpoint.startsWith(":");
    endpoint = `${local ? "ws" : "wss"}://${endpoint}`;
  }

  if (/[?&]token=/i.test(endpoint)) {
    return endpoint;
  }

  const token = process.env.BROWSERLESS_TOKEN?.trim() ?? "";
  if (!token) {
    throw new Error(
      "BROWSERLESS_TOKEN is required when BROWSERLESS_WS_ENDPOINT has no token= query.",
    );
  }

  const sep = endpoint.includes("?") ? "&" : "?";
  return `${endpoint}${sep}token=${encodeURIComponent(token)}`;
}

function wsUrlLogLabel(wsUrl: string): string {
  try {
    const u = new URL(wsUrl);
    u.searchParams.delete("token");
    const q = u.searchParams.toString();
    return `${u.origin}${u.pathname}${q ? `?${q}` : ""}`;
  } catch {
    return wsUrl.replace(/([?&])token=[^&]*/gi, "$1token=<redacted>");
  }
}

function hostedBrowserPersistedUrls(): {
  sessionId: string | null;
  sessionUrl: string | null;
} {
  const dash = process.env.BROWSERLESS_DASHBOARD_URL?.trim();
  return {
    sessionId: null,
    sessionUrl: dash && dash.length > 0 ? dash : null,
  };
}

async function getPlaywrightPageFromCdp(browser: Browser) {
  const ctx = browser.contexts()[0];
  if (ctx) {
    const pages = ctx.pages();
    if (pages.length > 0) {
      return pages[0];
    }
    return await ctx.newPage();
  }
  return await browser.newPage();
}

type GithubFileEntry = { path: string; content: string };

async function readGithubFile({
  owner,
  repo,
  path,
  branch,
  githubToken,
}: {
  owner: string;
  repo: string;
  path: string;
  branch: string;
  githubToken: string;
}): Promise<GithubFileEntry | null> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
    },
  );

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as { content?: string };

  if (!data.content) {
    return null;
  }

  const decodedContent = Buffer.from(data.content, "base64").toString("utf-8");

  return {
    path,
    content: decodedContent.slice(0, 5000),
  };
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/** True when Gemini is overloaded / rate limited — worth retrying or switching models. */
function transientGeminiError(err: unknown): boolean {
  if (err !== null && typeof err === "object") {
    const status = Reflect.get(err, "status");
    const n =
      typeof status === "number" ? status : Number.parseInt(String(status), 10);
    if (!Number.isNaN(n) && (n === 429 || n === 503)) return true;
  }

  const s =
    typeof err === "object" &&
    err !== null &&
    typeof (err as { message?: unknown }).message === "string"
      ? (err as { message: string }).message
      : String(err);

  try {
    if (/UNAVAILABLE|RESOURCE_EXHAUSTED|HIGH_DEMAND/i.test(JSON.stringify(err))) {
      return true;
    }
  } catch {
    /* ignore */
  }

  return /503|429|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|try again later|overloaded|rate limit|EAI_AGAIN/i.test(s);
}

/**
 * Generate script body from Gemini with retries across models when the API is flaky.
 */
async function generateGeminiAutomationScript(
  prompt: string,
): Promise<{ script: string; usage: GeminiTokenUsage }> {
  const primary =
    process.env.GEMINI_SCRIPT_MODEL?.trim() || "gemini-2.5-flash";
  const fb =
    process.env.GEMINI_SCRIPT_MODEL_FALLBACK?.trim() || "gemini-2.0-flash";
  const chain = [...new Set([primary, fb].filter(Boolean))];

  let lastErr: unknown;

  let maxPerModel = Number.parseInt(
    process.env.GEMINI_RETRY_ATTEMPTS || "3",
    10,
  );
  if (!Number.isFinite(maxPerModel) || maxPerModel < 1) maxPerModel = 3;
  maxPerModel = Math.min(maxPerModel, 6);

  for (const model of chain) {
    for (let attempt = 1; attempt <= maxPerModel; attempt++) {
      try {
        const response = await getGemini().models.generateContent({
          model,
          contents: prompt,
        });
        const usage = extractGeminiUsageFromResponse(response);
        const text = (response.text ?? "").trim();
        if (!text) {
          throw new Error("Gemini returned an empty automation script.");
        }
        return { script: text, usage };
      } catch (e) {
        lastErr = e;
        if (!transientGeminiError(e)) throw e;
        if (attempt >= maxPerModel) break;
        await sleep(Math.min(12000, 1200 * 2 ** (attempt - 1)));
      }
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

function joinBaseAndRoute(baseUrl: string, targetRoute: string | null | undefined) {
  const base = baseUrl.replace(/\/+$/, "");
  const route = (targetRoute ?? "").trim();
  if (!route || route === "/") {
    return `${base}/`;
  }
  const path = route.startsWith("/") ? route.slice(1) : route;
  return `${base}/${path}`;
}

function buildGeminiPrompt(params: {
  baseUrl: string;
  testCase: TestCase;
  repoContext: string;
  globalInstruction: string;
  customPrompt: string;
}) {
  const { baseUrl, testCase, repoContext, globalInstruction, customPrompt } =
    params;

  const gotoUrl = joinBaseAndRoute(baseUrl, testCase.targetRoute);
  const expected = testCase.expectedResult?.trim() || "(not specified)";

  const globalIns = globalInstruction
    ? `\n[GLOBAL PROJECT INSTRUCTIONS] (Follow strictly):\n${globalInstruction}\n`
    : "";

  const tempIns = customPrompt
    ? `\n[ADDITIONAL RUNTIME INSTRUCTIONS] (Follow strictly):\n${customPrompt}\n`
    : "";

  return `You are an expert QA automation engineer.
Your task is to write a Playwright Node.js script body that executes a test case on an application whose base URL is: ${baseUrl}
Test Case Details:
Title: ${testCase.title}
Description: ${testCase.description}
Target Route: ${testCase.targetRoute || "/"}
Expected Result (use for lenient, case-insensitive substring checks on page text when appropriate): ${expected}
${globalIns}${tempIns}
Source File Context for Reference (Read this to extract exact tags, component text, input fields, and class names):
${repoContext || "No source file context available for this test case."}

Write only the JavaScript code that executes within an async function context.
The following parameters are passed into your function: page (Playwright Page), assert (function), console (logging object).

IMPORTANT:
- Do NOT import anything. No require, no import, no assert module.
- At the very beginning of your generated code, define this helper if you need assertions (the runner also passes assert, but your code may define its own or use the parameter):
  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }
  (If you redefine assert, keep the same signature and behavior.)

Rules for your code:
- DO NOT import playwright, puppeteer, Node's built-in assert module, or any other packages.
- Navigate to the full URL for this test using exactly:
  await page.goto(${JSON.stringify(gotoUrl)}, { waitUntil: 'load', timeout: 15000 });
  Then await page.waitForTimeout(1000) to settle.
- Use the Source File Context to choose resilient locators: getByPlaceholder, getByRole, locator with name/text, etc.
- Wait for visibility before interacting: await locator.waitFor({ state: 'visible', timeout: 12000 }).catch(() => {}).
- Scroll into view before clicks: await locator.scrollIntoViewIfNeeded().catch(() => {}).
- Use flexible clicks with fallback when needed.
- After major actions, await page.waitForTimeout(1000) for SPA updates.
- Prefer case-insensitive substring checks against body or key elements for expected results.
- Use console.log for clear step logs.

Return ONLY raw executable JavaScript.
DO NOT wrap in markdown code fences.
DO NOT add commentary.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawId = body.testCaseId;
    const baseUrl = typeof body.baseUrl === "string" ? body.baseUrl.trim() : "";
    const mode = typeof body.mode === "string" ? body.mode : "generate";
    const customPrompt =
      typeof body.customPrompt === "string" ? body.customPrompt : "";

    const testCaseId = Number(rawId);
    if (!Number.isFinite(testCaseId) || testCaseId <= 0 || !baseUrl) {
      return NextResponse.json(
        { error: "testCaseId and baseUrl are required" },
        { status: 400 },
      );
    }

    const auth = await getAuthenticatedDbUser();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { user: dbUser } = auth;

    const [testCase] = await db
      .select()
      .from(TestCasesTable)
      .where(eq(TestCasesTable.id, testCaseId));

    if (!testCase) {
      return NextResponse.json(
        { error: "Test case not found" },
        { status: 404 },
      );
    }

    if (String(testCase.userId).trim() !== String(dbUser.id).trim()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const githubTokenCookie =
      cookieStore.get("github_access_token")?.value ??
      cookieStore.get("gh_token")?.value;
    const githubToken = githubTokenCookie?.trim() ?? "";
    if (!githubToken) {
      return NextResponse.json(
        {
          error:
            "GitHub is not connected. Connect GitHub in the workspace to run tests.",
        },
        { status: 401 },
      );
    }

    const statusBeforeRun = testCase.status ?? "generated";

    let creditsRemaining = dbUser.credits;

    const metering: {
      aiGenerationCreditsCharged?: number;
      geminiUsage?: GeminiTokenUsage;
      browserlessCreditsCharged?: number;
      hostedBrowserSecondsApprox?: number;
    } = {};

    let repoRecord: Repository | undefined;
    const repoIdNum = testCase.repoId
      ? parseInt(String(testCase.repoId), 10)
      : NaN;

    if (Number.isFinite(repoIdNum)) {
      const [r] = await db
        .select()
        .from(repositories)
        .where(eq(repositories.repoId, repoIdNum));
      repoRecord = r;
    }

    if (!repoRecord) {
      const [r] = await db
        .select()
        .from(repositories)
        .where(
          eq(
            repositories.fullName,
            `${testCase.repoOwner}/${testCase.repoName}`,
          ),
        );
      repoRecord = r;
    }

    let scriptText = testCase.browserbaseScript ?? "";
    const forceRegenerate = mode === "generate" || !scriptText;

    if (forceRegenerate) {
      const targetFiles = testCase.targetFiles || [];
      let repoContext = "";

      if (targetFiles.length > 0) {
        const branch = testCase.branch || "main";
        const fileContents = await Promise.all(
          targetFiles.map((path) =>
            readGithubFile({
              owner: testCase.repoOwner,
              repo: testCase.repoName,
              branch,
              path,
              githubToken,
            }),
          ),
        );

        const validFiles = fileContents.filter(
          (f): f is GithubFileEntry => f != null,
        );
        repoContext = validFiles
          .map(
            (file) => `
File Path: ${file.path}
File Content:
${file.content}`,
          )
          .join("\n\n----------------------\n\n");
      }

      const globalInstruction = repoRecord?.globalInstruction?.trim() ?? "";

      const prompt = buildGeminiPrompt({
        baseUrl,
        testCase,
        repoContext,
        globalInstruction,
        customPrompt: customPrompt.trim(),
      });

      const scriptMaxOutParsed = Number.parseInt(
        process.env.GEMINI_SCRIPT_MAX_OUTPUT_TOKENS_ESTIMATE ?? "",
        10,
      );
      const scriptMaxOutEstimate =
        Number.isFinite(scriptMaxOutParsed) && scriptMaxOutParsed > 0
          ? scriptMaxOutParsed
          : 8_192;

      const preflightAiCredits = estimateCreditsBeforeGeminiCall(
        prompt.length,
        scriptMaxOutEstimate,
      );
      if (creditsRemaining < preflightAiCredits) {
        return NextResponse.json(
          {
            success: false,
            error: "Insufficient credits for AI script generation.",
            creditsRemaining,
            estimatedCreditsRequired: preflightAiCredits,
          },
          { status: 402 },
        );
      }

      let generatedGemini;
      try {
        generatedGemini = await generateGeminiAutomationScript(prompt);
      } catch (geminiErr: unknown) {
        const transient = transientGeminiError(geminiErr);
        console.error("Gemini script generation failed:", geminiErr);
        return NextResponse.json(
          {
            success: false,
            error: transient
              ? "Gemini is temporarily overloaded. Please try again in a minute."
              : "Gemini could not generate a script. Check GEMINI_SCRIPT_MODEL/GEMINI_API_KEY or try later.",
            creditsRemaining,
          },
          { status: transient ? 503 : 502 },
        );
      }

      let generatedCode = generatedGemini.script;
      generatedCode = generatedCode.replace(/^```(?:javascript|js)?\s*/i, "");
      generatedCode = generatedCode.replace(/```\s*$/, "");
      generatedCode = generatedCode.trim();

      if (!generatedCode) {
        return NextResponse.json(
          {
            error: "Gemini failed to generate an automation script",
            creditsRemaining,
          },
          { status: 500 },
        );
      }

      const aiBillCredits = creditsFromMeasuredGemini(
        generatedGemini.usage,
        prompt.length,
        generatedCode.length,
      );
      const aiDebit = await consumeCreditsClamped(dbUser.id, aiBillCredits);
      creditsRemaining = aiDebit.creditsRemaining;

      metering.aiGenerationCreditsCharged = aiDebit.charged;
      metering.geminiUsage = generatedGemini.usage;

      scriptText = generatedCode;

      await db
        .update(TestCasesTable)
        .set({
          browserbaseScript: scriptText,
          status: "running",
        })
        .where(eq(TestCasesTable.id, testCase.id));
    } else {
      await db
        .update(TestCasesTable)
        .set({ status: "running" })
        .where(eq(TestCasesTable.id, testCase.id));
    }

    let wsUrl: string;
    try {
      wsUrl = resolveBrowserlessConnectUrl();
    } catch (configErr: unknown) {
      const message =
        configErr instanceof Error ? configErr.message : String(configErr);
      return NextResponse.json(
        { success: false, error: message, creditsRemaining },
        { status: 500 },
      );
    }

    const minBrowserCredits = peekMinCreditsForBrowserlessSession();
    if (creditsRemaining < minBrowserCredits) {
      await db
        .update(TestCasesTable)
        .set({ status: statusBeforeRun })
        .where(eq(TestCasesTable.id, testCase.id));
      return NextResponse.json(
        {
          success: false,
          error:
            "Insufficient credits for hosted browser execution (below minimum Browserless reservation).",
          creditsRemaining,
          estimatedCreditsRequired: minBrowserCredits,
        },
        { status: 402 },
      );
    }

    const logs: string[] = [];
    const customConsole = {
      log: (...args: unknown[]) => {
        logs.push(
          args
            .map((a) =>
              typeof a === "object" ? JSON.stringify(a) : String(a),
            )
            .join(" "),
        );
      },
      error: (...args: unknown[]) => {
        logs.push(
          `[ERROR] ${args
            .map((a) =>
              typeof a === "object" ? JSON.stringify(a) : String(a),
            )
            .join(" ")}`,
        );
      },
      warn: (...args: unknown[]) => {
        logs.push(
          `[WARN] ${args
            .map((a) =>
              typeof a === "object" ? JSON.stringify(a) : String(a),
            )
            .join(" ")}`,
        );
      },
    };

    let browser: Awaited<ReturnType<typeof chromium.connectOverCDP>> | null =
      null;
    let browserSessionStartedAt: number | null = null;

    /** Bill Browserless/CDP attached wall time once disconnect completes. */
    const finalizeBrowserCredits = async (): Promise<{
      charged: number;
      secondsApprox: number;
    }> => {
      if (browserSessionStartedAt === null)
        return { charged: 0, secondsApprox: 0 };

      const started = browserSessionStartedAt;
      browserSessionStartedAt = null;
      const wallSec = Math.max(0, (Date.now() - started) / 1000);

      const desired = creditsForBrowserlessWallSeconds(wallSec);

      const deb = await consumeCreditsClamped(dbUser.id, desired);
      creditsRemaining = deb.creditsRemaining;

      return { charged: deb.charged, secondsApprox: wallSec };
    };

    const persisted = hostedBrowserPersistedUrls();

    let execFailedMessage: string | null = null;

    try {
      logs.push(
        `[SYSTEM] Connecting hosted browser (Browserless) at ${wsUrlLogLabel(wsUrl)}`,
      );

      const browserInstance = await chromium.connectOverCDP(wsUrl);
      browser = browserInstance;
      browserSessionStartedAt = Date.now();

      const page = await getPlaywrightPageFromCdp(browserInstance);

      page.on("console", (msg) => {
        logs.push(`[BROWSER] [${msg.type().toUpperCase()}] ${msg.text()}`);
      });

      logs.push(
        `[SYSTEM] Connected via Browserless; executing automation script…`,
      );

      const AsyncFunction = Object.getPrototypeOf(async function () {})
        .constructor as new (...args: string[]) => (
        ...fnArgs: unknown[]
      ) => Promise<void>;

      const runFn = new AsyncFunction("page", "assert", "console", scriptText);

      const assertHelper = (condition: boolean, message?: string) => {
        if (!condition) {
          throw new Error(message || "Assertion failed");
        }
      };

      await runFn(page, assertHelper, customConsole);

      logs.push(
        `[SYSTEM] Script execution completed successfully without errors.`,
      );

      await page.close().catch(() => {});
    } catch (execError: unknown) {
      console.error("Script execution error:", execError);
      const message =
        execError instanceof Error
          ? execError.message
          : String(execError);
      execFailedMessage = message;
      logs.push(`[SYSTEM ERROR] Script execution failed: ${message}`);
    } finally {
      if (browser) {
        await browser.close().catch(() => {});
      }
      browser = null;

      const brBill = await finalizeBrowserCredits();

      if (brBill.secondsApprox > 0) {
        metering.browserlessCreditsCharged = brBill.charged;
        metering.hostedBrowserSecondsApprox = Number(
          brBill.secondsApprox.toFixed(2),
        );
      }
    }

    await db
      .update(TestCasesTable)
      .set(
        execFailedMessage
          ? {
              status: "failed",
              browserbaseScript: scriptText,
              logs,
              sessionId: persisted.sessionId,
              sessionUrl: persisted.sessionUrl,
            }
          : {
              status: "passed",
              browserbaseScript: scriptText,
              logs,
              sessionId: persisted.sessionId,
              sessionUrl: persisted.sessionUrl,
            },
      )
      .where(eq(TestCasesTable.id, testCase.id));

    if (execFailedMessage) {
      return NextResponse.json({
        success: false,
        status: "failed",
        error: execFailedMessage,
        sessionId: persisted.sessionId,
        sessionUrl: persisted.sessionUrl,
        logs,
        browserbaseScript: scriptText,
        creditsRemaining,
        metering,
      });
    }

    return NextResponse.json({
      success: true,
      status: "passed",
      sessionId: persisted.sessionId,
      sessionUrl: persisted.sessionUrl,
      logs,
      browserbaseScript: scriptText,
      creditsRemaining,
      metering,
    });
  } catch (error: unknown) {
    console.error("API endpoint error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: message || "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
