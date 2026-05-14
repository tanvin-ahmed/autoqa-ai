/**
 * Heuristic guard: real Clerk keys are long, base64-backed strings.
 * Placeholders like "pk_test_placeholder" pass prefix checks but fail at runtime.
 */
export function isClerkConfigured(): boolean {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  const sk = process.env.CLERK_SECRET_KEY ?? "";
  if (!pk || !sk) return false;
  const pkOk =
    (pk.startsWith("pk_test_") || pk.startsWith("pk_live_")) && pk.length >= 40;
  const skOk =
    (sk.startsWith("sk_test_") || sk.startsWith("sk_live_")) && sk.length >= 40;
  if (!pkOk || !skOk) return false;
  if (/placeholder|your_|\.{3}\s*$/i.test(pk) || /placeholder|your_|\.{3}\s*$/i.test(sk)) {
    return false;
  }
  return true;
}
