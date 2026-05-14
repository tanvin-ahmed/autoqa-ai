export function ClerkSetupHint() {
  return (
    <main
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#09090b",
        color: "#fafafa",
        fontFamily: "system-ui, sans-serif",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "28rem", textAlign: "center", lineHeight: 1.6 }}>
        <h1 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>Clerk is not configured</h1>
        <p style={{ color: "#a1a1aa", marginBottom: "1rem", fontSize: "0.9375rem" }}>
          Add valid{" "}
          <code style={{ color: "#e4e4e7" }}>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and{" "}
          <code style={{ color: "#e4e4e7" }}>CLERK_SECRET_KEY</code> from the Clerk dashboard to{" "}
          <code style={{ color: "#e4e4e7" }}>.env</code>. Example placeholders like{" "}
          <code style={{ color: "#e4e4e7" }}>pk_test_placeholder</code> are rejected.
        </p>
        <a
          href="https://dashboard.clerk.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#38bdf8", fontWeight: 600 }}
        >
          Open Clerk dashboard
        </a>
      </div>
    </main>
  );
}
