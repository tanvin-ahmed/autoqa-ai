import { NextResponse } from "next/server";
import { z } from "zod";

import { getStripe } from "@/lib/stripe";

import { getAuthenticatedDbUser } from "@/lib/server/db-user-auth";
import {
  getCreditsTopUpPriceId,
  getProMonthlyPriceId,
  normalizeAppBaseUrl,
} from "@/lib/server/stripe-config";
import { getOrCreateStripeCustomer } from "@/lib/server/stripe-customer";

export const runtime = "nodejs";

const bodySchema = z.object({
  plan: z.enum(["pro_monthly", "credits_topup"]),
});

export async function POST(req: Request) {
  try {
    const auth = await getAuthenticatedDbUser();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Body must include `plan`: \"pro_monthly\" | \"credits_topup\".",
        },
        { status: 400 },
      );
    }

    const { plan } = parsed.data;
    const proPriceId = getProMonthlyPriceId();
    const topupPriceId = getCreditsTopUpPriceId();

    if (plan === "pro_monthly" && !proPriceId) {
      return NextResponse.json(
        {
          error:
            "Billing is not configured: set STRIPE_PRICE_PRO_MONTHLY in the server environment.",
        },
        { status: 503 },
      );
    }

    if (plan === "credits_topup" && !topupPriceId) {
      return NextResponse.json(
        {
          error:
            "Credit top-ups are not enabled (optional STRIPE_PRICE_CREDITS_TOPUP).",
        },
        { status: 503 },
      );
    }

    const stripe = getStripe();
    const user = auth.user;

    const customerId = await getOrCreateStripeCustomer(user);

    const base = normalizeAppBaseUrl();

    const successUrl = `${base}/workspace?stripe_success=1`;
    const cancelUrl = `${base}/pricing?stripe_cancel=1`;

    if (plan === "pro_monthly") {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        client_reference_id: String(user.id),
        line_items: [{ price: proPriceId!, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        metadata: {
          app_user_id: String(user.id),
        },
        subscription_data: {
          metadata: {
            app_user_id: String(user.id),
          },
        },
      });

      return NextResponse.json({ url: session.url, sessionId: session.id });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      client_reference_id: String(user.id),
      line_items: [{ price: topupPriceId!, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        app_user_id: String(user.id),
        fulfillment_type: "credits_topup",
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (e: unknown) {
    console.error("[checkout/stripe]", e);
    const message =
      e instanceof Error ? e.message : "Stripe Checkout could not be created.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
