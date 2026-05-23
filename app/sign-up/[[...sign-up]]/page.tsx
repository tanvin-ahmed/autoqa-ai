import type { Metadata } from "next";

import { SignUp } from "@clerk/nextjs";
import { ClerkSetupHint } from "@/components/ClerkSetupHint";
import { isClerkConfigured } from "@/lib/env/clerk";
import { SITE_SHORT_NAME } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Sign up",
  description: `Create your ${SITE_SHORT_NAME} workspace — AI test scenarios and hosted runs for JS/TS repos.`,
  robots: { index: false, follow: true },
};

export default function SignUpPage() {
  if (!isClerkConfigured()) {
    return <ClerkSetupHint />;
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <SignUp />
    </main>
  );
}
