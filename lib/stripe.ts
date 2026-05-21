import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

/** Lazily construct Stripe SDK so missing env fails at request time (not module import during build). */
export function getStripe(): Stripe {
  if (stripeSingleton) return stripeSingleton;

  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  stripeSingleton = new Stripe(key, {
    typescript: true,
    appInfo: {
      name: "Auto QA AI",
      version: process.env.npm_package_version ?? undefined,
    },
  });

  return stripeSingleton;
}
