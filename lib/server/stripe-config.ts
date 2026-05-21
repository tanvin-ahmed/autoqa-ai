/** Server-only Stripe Dashboard price IDs & credit economics. */

function envInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw === "") return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

export function normalizeAppBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

/** Recurring Pro plan price id (`price_*`) configured in Stripe. */
export function getProMonthlyPriceId(): string | undefined {
  const id = process.env.STRIPE_PRICE_PRO_MONTHLY?.trim();
  return id || undefined;
}

/** Optional one-time “top up credits” Checkout price (`price_*`). */
export function getCreditsTopUpPriceId(): string | undefined {
  const id = process.env.STRIPE_PRICE_CREDITS_TOPUP?.trim();
  return id || undefined;
}

/** Credits added on each paid Pro invoice (signup + renewals). */
export function creditsGrantedPerPaidSubscriptionInvoice(): number {
  return envInt("CREDITS_SUBSCRIPTION_MONTHLY", 10_000);
}

/** Credits for a successful one-time top-up Checkout (when configured). */
export function creditsGrantedForConfiguredTopUp(): number {
  return envInt("CREDITS_TOPUP_AMOUNT", 5_000);
}
