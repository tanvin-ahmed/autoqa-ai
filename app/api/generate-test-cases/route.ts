import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { TestCasesTable, users } from "@/db/schema";
import { cookies } from "next/headers";

import { consumeCreditsClamped, refundCredits } from "@/lib/server/credits";
import { getAuthenticatedDbUser } from "@/lib/server/db-user-auth";
import {
  creditsFromMeasuredGemini,
  estimateCreditsBeforeGeminiCall,
  extractGeminiUsageFromResponse,
} from "@/lib/server/usage-credits";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const ALLOWED_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".json", ".md"];

const IMPORTANT_FILES = [
  "package.json",
  "next.config",
  "middleware",
  "app/",
  "pages/",
  "components/",
  "src/",
  "lib/",
  "utils/",
  "actions/",
  "api/",
  "server/",
];

const IGNORE_PATHS = [
  "node_modules",
  ".next",
  "dist",
  "build",
  ".git",
  "coverage",
  "public/",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".webp",
  ".mp4",
  ".mov",
];

function isUsefulFile(path: string) {
  const isIgnored = IGNORE_PATHS.some((item) => path.includes(item));

  const isAllowedExtension = ALLOWED_EXTENSIONS.some((ext) =>
    path.endsWith(ext),
  );

  const isImportantPath = IMPORTANT_FILES.some((item) => path.includes(item));

  return !isIgnored && isAllowedExtension && isImportantPath;
}

async function getRepoTree({
  owner,
  repo,
  branch,
  githubToken,
}: {
  owner: string;
  repo: string;
  branch: string;
  githubToken: string;
}) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch GitHub repo tree");
  }

  const data = await res.json();

  return data.tree
    .filter((item: any) => item.type === "blob")
    .filter((item: any) => isUsefulFile(item.path))
    .slice(0, 25);
}

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
}) {
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

  const data = await res.json();

  if (!data.content) {
    return null;
  }

  const decodedContent = Buffer.from(data.content, "base64").toString("utf-8");

  return {
    path,
    content: decodedContent.slice(0, 5000),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { userId: bodyUserId, repoId, owner, repo, branch = "main" } = body;

    const auth = await getAuthenticatedDbUser();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { user: dbUser } = auth;

    if (typeof bodyUserId !== "number" && typeof bodyUserId !== "string") {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }
    const uid = typeof bodyUserId === "number" ? bodyUserId : Number(bodyUserId);
    if (!Number.isFinite(uid) || uid !== dbUser.id) {
      return NextResponse.json({ error: "Forbidden: user mismatch" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const githubToken = cookieStore.get("github_access_token")?.value;

    if (!owner || !repo || !githubToken) {
      return NextResponse.json(
        {
          error: "owner, repo and githubToken are required",
        },
        { status: 400 },
      );
    }

    // 1. Get repo tree
    const repoFiles = await getRepoTree({
      owner,
      repo,
      branch,
      githubToken,
    });

    // 2. Read useful files
    const fileContents = await Promise.all(
      repoFiles.map((file: any) =>
        readGithubFile({
          owner,
          repo,
          branch,
          path: file.path,
          githubToken,
        }),
      ),
    );

    const validFiles = fileContents.filter(Boolean);

    if (validFiles.length === 0) {
      return NextResponse.json(
        {
          error: "No useful source files found in this repository",
        },
        { status: 400 },
      );
    }

    // 3. Prepare compact repo context
    const repoContext = validFiles
      .map(
        (file: any) => `
            File Path: ${file.path}

            File Content:
            ${file.content}
            `,
      )
      .join("\n\n----------------------\n\n");

    const suiteMaxOutParsed = Number.parseInt(
      process.env.GEMINI_SUITE_MAX_OUTPUT_TOKENS_ESTIMATE ?? "",
      10,
    );
    const suiteMaxOutEstimate =
      Number.isFinite(suiteMaxOutParsed) && suiteMaxOutParsed > 0
        ? suiteMaxOutParsed
        : 8_192;

    // 4. Ask Gemini to generate test cases with metadata
    const prompt = `
    You are an expert QA automation engineer.

    Analyze the GitHub repository source code and generate useful small test cases.

    Your goal:
    Generate test cases that can later be automated with Playwright in a hosted cloud browser session.

    Repository:
    Owner: ${owner}
    Repo: ${repo}
    Branch: ${branch}

    Repository File Context:
    ${repoContext}

    Generate 5 to 10 test cases.

    Each test case must include:
    - title: clear test case title
    - description: one-line description
    - type: one of ui, auth, api, form, integration, edge-case
    - priority: low, medium, high
    - targetRoute: most likely app route/page to test, for example /sign-in, /dashboard, /api/users
    - targetFiles: related file paths from the repository context
    - expectedResult: what should happen when the test passes

    Important rules:
    - Only use file paths that exist in the repository context.
    - Do not invent fake target files.
    - If route is unclear, infer from Next.js app/page structure.
    - Keep description short, only one line.
    - Return only valid JSON.
    `;

    const suiteEstimate = estimateCreditsBeforeGeminiCall(
      prompt.length,
      suiteMaxOutEstimate,
    );
    if (dbUser.credits < suiteEstimate) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient credits to generate test cases.",
          creditsRemaining: dbUser.credits,
          estimatedCreditsRequired: suiteEstimate,
        },
        { status: 402 },
      );
    }

    const suiteModel =
      process.env.GEMINI_SUITE_MODEL?.trim() || "gemini-2.5-flash";

    let response;
    try {
      response = await ai.models.generateContent({
      model: suiteModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            testCases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                  },
                  description: {
                    type: Type.STRING,
                  },
                  type: {
                    type: Type.STRING,
                    enum: [
                      "ui",
                      "auth",
                      "api",
                      "form",
                      "integration",
                      "edge-case",
                    ],
                  },
                  priority: {
                    type: Type.STRING,
                    enum: ["low", "medium", "high"],
                  },
                  targetRoute: {
                    type: Type.STRING,
                  },
                  targetFiles: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                    },
                  },
                  expectedResult: {
                    type: Type.STRING,
                  },
                },
                required: [
                  "title",
                  "description",
                  "type",
                  "priority",
                  "targetRoute",
                  "targetFiles",
                  "expectedResult",
                ],
              },
            },
          },
          required: ["testCases"],
        },
      },
    });
    } catch (geminiErr: unknown) {
      console.error("Gemini suite generation failed:", geminiErr);
      return NextResponse.json(
        {
          success: false,
          error: "Gemini could not generate test cases right now.",
          creditsRemaining: dbUser.credits,
        },
        { status: 502 },
      );
    }

    const usageMeta = extractGeminiUsageFromResponse(response);
    const outputCharLen = (response.text ?? "").length;
    const billAmount = creditsFromMeasuredGemini(
      usageMeta,
      prompt.length,
      outputCharLen,
    );
    const billed = await consumeCreditsClamped(dbUser.id, billAmount);
    let creditsRemaining = billed.creditsRemaining;
    const chargedSuite = billed.charged;

    let aiResult: { testCases?: unknown };
    try {
      aiResult = JSON.parse(response.text || "{}") as {
        testCases?: unknown;
      };
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Gemini returned invalid JSON for test cases",
          creditsRemaining,
          metering: {
            geminiCreditsCharged: chargedSuite,
            usage: usageMeta,
          },
        },
        { status: 400 },
      );
    }

    const testCases = Array.isArray(aiResult.testCases)
      ? aiResult.testCases
      : [];

    if (!testCases.length) {
      return NextResponse.json(
        {
          error: "Gemini did not generate any test cases",
          creditsRemaining,
          metering: {
            geminiCreditsCharged: chargedSuite,
            usage: usageMeta,
          },
        },
        { status: 400 },
      );
    }

    // 5. Save generated test cases to Neon DB
    let insertedTestCases;
    try {
      insertedTestCases = await db
        .insert(TestCasesTable)
        .values(
          testCases.map((testCase: any) => ({
            userId: String(dbUser.id),
            repoId,
            repoName: repo,
            repoOwner: owner,
            branch,

            title: testCase.title,
            description: testCase.description,
            type: testCase.type,
            priority: testCase.priority,

            targetRoute: testCase.targetRoute,
            targetFiles: testCase.targetFiles || [],
            expectedResult: testCase.expectedResult,

            status: "generated",
          })),
        )
        .returning();
    } catch (dbInsertErr: unknown) {
      console.error("Failed to persist generated test cases:", dbInsertErr);
      await refundCredits(dbUser.id, chargedSuite);

      const [reload] = await db
        .select({ credits: users.credits })
        .from(users)
        .where(eq(users.id, dbUser.id))
        .limit(1);
      creditsRemaining = reload?.credits ?? creditsRemaining;

      return NextResponse.json(
        {
          success: false,
          error: "Failed to save generated test cases. Credits were refunded.",
          creditsRemaining,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test cases generated successfully",
      count: insertedTestCases.length,
      testCases: insertedTestCases,
      creditsRemaining,
      metering: {
        geminiCreditsCharged: chargedSuite,
        usage: usageMeta,
      },
    });
  } catch (error: any) {
    console.error("Generate test cases error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate test cases",
      },
      { status: 500 },
    );
  }
}
