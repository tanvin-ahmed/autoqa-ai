import { SignUp } from "@clerk/nextjs";
import { ClerkSetupHint } from "@/components/ClerkSetupHint";
import { isClerkConfigured } from "@/lib/env/clerk";

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
