import { eq, sql, gte, and } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

/**
 * Atomically subtract credits if the row has sufficient balance (single UPDATE … WHERE credits >= amount).
 */
export async function consumeCredits(
  userId: number,
  amount: number,
): Promise<{ ok: true; creditsRemaining: number } | { ok: false }> {
  const n = Math.floor(amount);
  if (!Number.isFinite(n) || n <= 0) {
    const [row] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!row) return { ok: false };
    return { ok: true, creditsRemaining: row.credits };
  }

  const updated = await db
    .update(users)
    .set({ credits: sql`${users.credits} - ${n}` })
    .where(and(eq(users.id, userId), gte(users.credits, n)))
    .returning({ credits: users.credits });

  if (updated.length === 0) {
    return { ok: false };
  }

  return { ok: true, creditsRemaining: updated[0].credits };
}

/**
 * Debit up to `requestedAmount`; never leaves the balance negative (under-run / race safe).
 *
 * Returned `charged` is what was actually subtracted (may be less than requested).
 */
export async function consumeCreditsClamped(
  userId: number,
  requestedAmount: number,
): Promise<{ charged: number; creditsRemaining: number }> {
  const n = Math.floor(Math.max(0, requestedAmount));
  if (!Number.isFinite(n) || n <= 0) {
    const [row] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const c = row?.credits ?? 0;
    return { charged: 0, creditsRemaining: c };
  }

  const [before] = await db
    .select({ credits: users.credits })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const balance = before?.credits ?? 0;

  const take = Math.min(n, balance);

  if (take <= 0) {
    return { charged: 0, creditsRemaining: balance };
  }

  const res = await consumeCredits(userId, take);

  if (!res.ok) {
    const [reload] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const c = reload?.credits ?? balance;
    const nextTake = Math.min(n, c);
    if (nextTake <= 0 || nextTake === take) {
      return { charged: 0, creditsRemaining: c };
    }

    const res2 = await consumeCredits(userId, nextTake);
    if (!res2.ok) {
      return { charged: 0, creditsRemaining: c };
    }
    return { charged: nextTake, creditsRemaining: res2.creditsRemaining };
  }

  return { charged: take, creditsRemaining: res.creditsRemaining };
}

export async function refundCredits(userId: number, amount: number): Promise<void> {
  const n = Math.floor(amount);
  if (!Number.isFinite(n) || n <= 0) return;

  await db
    .update(users)
    .set({ credits: sql`${users.credits} + ${n}` })
    .where(eq(users.id, userId));
}

/** Add credits after Stripe payment fulfillment (positive integer only). */
export async function addCreditsToUser(userId: number, amount: number): Promise<void> {
  const n = Math.floor(amount);
  if (!Number.isFinite(n) || n <= 0) return;

  await db
    .update(users)
    .set({ credits: sql`${users.credits} + ${n}` })
    .where(eq(users.id, userId));
}
