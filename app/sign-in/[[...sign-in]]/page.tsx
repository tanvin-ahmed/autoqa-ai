import type { Metadata } from "next";

import { SignIn } from "@clerk/nextjs";
import { ClerkSetupHint } from "@/components/ClerkSetupHint";
import { isClerkConfigured } from "@/lib/env/clerk";
import { SITE_SHORT_NAME } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to ${SITE_SHORT_NAME} — GitHub-connected AI test automation for JavaScript & TypeScript repos.`,
  robots: { index: false, follow: true },
};

export default function SignInPage() {
  if (!isClerkConfigured()) {
    return <ClerkSetupHint />;
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <SignIn />
    </main>
  );
}
