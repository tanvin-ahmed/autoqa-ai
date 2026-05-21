export function ClerkSetupHint() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 py-16 text-center text-foreground antialiased">
      <div className="max-w-lg space-y-4 leading-relaxed">
        <h1 className="text-xl font-semibold tracking-tight">
          Clerk is not configured
        </h1>
        <p className="text-sm text-muted-foreground">
          Add valid{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem] text-foreground">
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
          </code>{" "}
          and{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem] text-foreground">
            CLERK_SECRET_KEY
          </code>{" "}
          from the Clerk dashboard to{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem] text-foreground">
            .env
          </code>
          . Example placeholders like{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem] text-foreground">
            pk_test_placeholder
          </code>{" "}
          are rejected.
        </p>
        <a
          href="https://dashboard.clerk.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-semibold text-primary underline-offset-4 hover:underline"
        >
          Open Clerk dashboard
        </a>
      </div>
    </main>
  );
}
