import type Stripe from "stripe";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  stripeFulfillmentClaims,
  stripeWebhookEvents,
  users,
} from "@/db/schema";
import { getStripe } from "@/lib/stripe";

import { addCreditsToUser } from "@/lib/server/credits";
import {
  creditsGrantedForConfiguredTopUp,
  creditsGrantedPerPaidSubscriptionInvoice,
  getCreditsTopUpPriceId,
  getProMonthlyPriceId,
} from "@/lib/server/stripe-config";

async function webhookEventHandledBefore(eventId: string): Promise<boolean> {
  const rows = await db
    .select({ id: stripeWebhookEvents.id })
    .from(stripeWebhookEvents)
    .where(eq(stripeWebhookEvents.eventId, eventId))
    .limit(1);
  return rows.length > 0;
}

async function markWebhookEventHandled(eventId: string): Promise<void> {
  await db
    .insert(stripeWebhookEvents)
    .values({ eventId })
    .onConflictDoNothing();
}

async function claimFulfillmentKey(key: string): Promise<boolean> {
  const ins = await db
    .insert(stripeFulfillmentClaims)
    .values({ fulfillmentKey: key })
    .onConflictDoNothing()
    .returning({
      fulfillmentKey: stripeFulfillmentClaims.fulfillmentKey,
    });
  return ins.length > 0;
}

async function releaseFulfillmentClaim(key: string): Promise<void> {
  await db
    .delete(stripeFulfillmentClaims)
    .where(eq(stripeFulfillmentClaims.fulfillmentKey, key));
}

function fulfillmentLog(evt: string, message: string, extra?: unknown) {
  if (extra !== undefined) {
    console.info(`[stripe:${evt}] ${message}`, extra);
  } else {
    console.info(`[stripe:${evt}] ${message}`);
  }
}

function lineItemPriceId(line: Stripe.InvoiceLineItem): string | null {
  const legacy = line as unknown as {
    price?: string | Stripe.Price | null;
  };

  const p = legacy.price;
  if (typeof p === "string") return p;
  if (typeof p === "object" && p !== null) {
    const del = Reflect.get(p as object, "deleted");
    if (del === true) {
      return null;
    }
    const id = Reflect.get(p as object, "id");
    if (typeof id === "string") return id;
  }

  const modern = line as unknown as {
    pricing?: {
      price_details?: { price?: string | null };
    };
  };

  const fromPricing =
    typeof modern.pricing?.price_details?.price === "string"
      ? modern.pricing.price_details.price
      : null;

  return fromPricing;
}

async function resolveUserIdFromCustomerId(customerId: string): Promise<number | null> {
  const [dbUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (dbUser) return dbUser.id;

  const stripe = getStripe();
  const cust = await stripe.customers.retrieve(customerId);
  if (cust.deleted) return null;

  const raw =
    cust.metadata?.app_user_id ?? cust.metadata?.appUserId ?? "";
  const n = Number.parseInt(String(raw).trim(), 10);
  return Number.isFinite(n) ? n : null;
}

export async function handleInvoicePaymentSucceeded(
  event: Stripe.Event,
): Promise<void> {
  const eventId = event.id;

  if (await webhookEventHandledBefore(eventId)) return;

  const invoice = event.data.object as Stripe.Invoice;

  if (!invoice.id) {
    fulfillmentLog(eventId, "invoice has no id, skipping");
    await markWebhookEventHandled(eventId);
    return;
  }

  const claimKey = `invoice.paid:${invoice.id}`;

  if (invoice.status !== "paid") {
    fulfillmentLog(eventId, "invoice not paid, skipping fulfillment");
    await markWebhookEventHandled(eventId);
    return;
  }

  const amountPaid = invoice.amount_paid ?? 0;
  if (amountPaid <= 0) {
    fulfillmentLog(eventId, "invoice has no paid amount, skipping fulfillment");
    await markWebhookEventHandled(eventId);
    return;
  }

  const br = invoice.billing_reason;
  if (br !== "subscription_create" && br !== "subscription_cycle") {
    fulfillmentLog(
      eventId,
      `billing_reason=${String(br)}, no subscription credit grant`,
    );
    await markWebhookEventHandled(eventId);
    return;
  }

  const customerIdRaw = invoice.customer;
  const customerId =
    typeof customerIdRaw === "string"
      ? customerIdRaw
      : customerIdRaw?.id ?? null;

  if (!customerId) {
    fulfillmentLog(eventId, "invoice has no customer, skipping fulfillment");
    await markWebhookEventHandled(eventId);
    return;
  }

  const proPrice = getProMonthlyPriceId();
  if (!proPrice) {
    fulfillmentLog(eventId, "STRIPE_PRICE_PRO_MONTHLY not configured, skipping");
    await markWebhookEventHandled(eventId);
    return;
  }

  const lines = invoice.lines?.data ?? [];
  const matched = lines.some((line) => lineItemPriceId(line) === proPrice);
  if (!matched) {
    fulfillmentLog(eventId, "no line items matched Pro monthly priceId, skipping", {
      proPrice,
    });
    await markWebhookEventHandled(eventId);
    return;
  }

  const userId = await resolveUserIdFromCustomerId(customerId);
  if (userId == null) {
    fulfillmentLog(
      eventId,
      `could not map Stripe customer ${customerId} to app user`,
    );
    await markWebhookEventHandled(eventId);
    return;
  }

  const claimed = await claimFulfillmentKey(claimKey);
  if (!claimed) {
    fulfillmentLog(eventId, "invoice already fulfilled (claim exists), skipping");
    await markWebhookEventHandled(eventId);
    return;
  }

  try {
    const grant = creditsGrantedPerPaidSubscriptionInvoice();
    await addCreditsToUser(userId, grant);
    fulfillmentLog(
      eventId,
      `granted subscription credits (+${grant}) to user ${userId}`,
    );
    await markWebhookEventHandled(eventId);
  } catch (grantErr) {
    await releaseFulfillmentClaim(claimKey);
    throw grantErr;
  }
}

export async function handleCheckoutSessionCompleted(
  event: Stripe.Event,
): Promise<void> {
  const eventId = event.id;

  if (await webhookEventHandledBefore(eventId)) return;

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.mode !== "payment") {
    fulfillmentLog(
      eventId,
      `mode=${session.mode} — subscriptions are fulfilled via invoice.payment_succeeded`,
    );
    await markWebhookEventHandled(eventId);
    return;
  }

  const sessionId = session.id ?? null;
  if (!sessionId) {
    fulfillmentLog(eventId, "checkout session has no id, skipping");
    await markWebhookEventHandled(eventId);
    return;
  }

  const claimKey = `checkout.payment:${sessionId}`;

  if (session.payment_status !== "paid") {
    fulfillmentLog(
      eventId,
      `checkout payment_status=${session.payment_status}, skipping`,
    );
    await markWebhookEventHandled(eventId);
    return;
  }

  const topupPriceId = getCreditsTopUpPriceId();
  const topupCredits = creditsGrantedForConfiguredTopUp();

  if (!topupPriceId || topupCredits <= 0) {
    fulfillmentLog(eventId, "top-up not configured or zero credits");
    await markWebhookEventHandled(eventId);
    return;
  }

  const stripe = getStripe();
  const full = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price"],
  });

  const lineItems = full.line_items?.data ?? [];
  const hasTopUp = lineItems.some((li) => {
    const row = li as unknown as {
      price?: string | Stripe.Price | null;
    };
    const pid = typeof row.price === "string" ? row.price : row.price?.id;
    return pid === topupPriceId;
  });

  if (!hasTopUp) {
    fulfillmentLog(
      eventId,
      "one-time Checkout did not include configured top-up price",
    );
    await markWebhookEventHandled(eventId);
    return;
  }

  const customerIdRaw = full.customer;
  const customerId =
    typeof customerIdRaw === "string"
      ? customerIdRaw
      : customerIdRaw?.id ?? null;

  const metaUid = Number.parseInt(
    String(full.metadata?.app_user_id ?? full.metadata?.appUserId ?? ""),
    10,
  );

  let userId: number | null = Number.isFinite(metaUid) ? metaUid : null;

  if (userId == null && customerId) {
    userId = await resolveUserIdFromCustomerId(customerId);
  }

  if (userId == null) {
    fulfillmentLog(
      eventId,
      "could not resolve app user for one-time Checkout credits",
    );
    await markWebhookEventHandled(eventId);
    return;
  }

  const claimed = await claimFulfillmentKey(claimKey);
  if (!claimed) {
    fulfillmentLog(eventId, "checkout session already fulfilled");
    await markWebhookEventHandled(eventId);
    return;
  }

  try {
    await addCreditsToUser(userId, topupCredits);
    fulfillmentLog(eventId, `granted top-up credits (+${topupCredits}) to user ${userId}`);
    await markWebhookEventHandled(eventId);
  } catch (grantErr) {
    await releaseFulfillmentClaim(claimKey);
    throw grantErr;
  }
}
