import { SignIn } from "@clerk/nextjs";
import { ClerkSetupHint } from "@/components/ClerkSetupHint";
import { isClerkConfigured } from "@/lib/env/clerk";

export default function SignInPage() {
  if (!isClerkConfigured()) {
    return <ClerkSetupHint />;
  }

  return (
    <main
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#09090b",
      }}
    >
      <SignIn />
    </main>
  );
}
