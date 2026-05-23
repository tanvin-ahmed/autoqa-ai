/** Shared FAQ copy for Landing FAQ UI + FAQPage JSON-LD. */

export type FaqPair = {
  readonly question: string;
  readonly answer: string;
};

export const landingFaqItems: readonly FaqPair[] = [
  {
    question: "Which repos can Auto QA analyze and test?",
    answer:
      "Today the product focuses on GitHub-hosted JavaScript and TypeScript projects—including typical MERN stacks (MongoDB, Express, React, Node.js) and broader JS/TS apps with npm-compatible tooling. Python, JVM, Ruby, Go, Rust, Swift, and other non-JS/TS codebases aren’t supported; connect a qualifying repo before generating or running suites.",
  },
  {
    question: "Do you run tests in CI or locally?",
    answer:
      "Connect a GitHub repo in your workspace so Auto QA understands your stack. Runs are surfaced in the workspace—wire them into CI when you’re ready.",
  },
  {
    question: "What does credits mean on the Workspace page?",
    answer:
      "Generation and execution consume credits according to workload. Paid tiers reserve higher monthly limits and priority usage so teams can iterate without stalls.",
  },
  {
    question: "Which frameworks do you infer from the repo?",
    answer:
      "Within qualifying JS and TypeScript repos, we look at package manifests, tsconfig/tsconfig paths, test configs, and runners such as Vitest, Jest, Playwright, and Cypress—so outputs match your tooling, not an invented DSL. That mapping only applies to JavaScript and TypeScript ecosystems (including MERN-style apps); other languages aren’t in scope.",
  },
  {
    question: "Where is my repository data handled?",
    answer:
      "Repository access flows through OAuth-scoped GitHub integration. Prefer private environments and least-privilege tokens; see Support for coordination on enterprise review.",
  },
] as const;
