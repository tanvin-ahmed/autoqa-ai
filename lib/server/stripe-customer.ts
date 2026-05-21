import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users, type User } from "@/db/schema";

import { getStripe } from "@/lib/stripe";

/** Ensure Stripe Customer exists + is linked on `users.stripe_customer_id`. */
export async function getOrCreateStripeCustomer(appUser: User): Promise<string> {
  const existing = appUser.stripeCustomerId?.trim();
  if (existing) return existing;

  const stripe = getStripe();

  const customer = await stripe.customers.create({
    email: appUser.email,
    metadata: {
      app_user_id: String(appUser.id),
    },
  });

  await db
    .update(users)
    .set({ stripeCustomerId: customer.id })
    .where(eq(users.id, appUser.id));

  return customer.id;
}
