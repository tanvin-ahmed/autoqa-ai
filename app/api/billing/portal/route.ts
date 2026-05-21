import { NextResponse } from "next/server";

import { getStripe } from "@/lib/stripe";

import { getAuthenticatedDbUser } from "@/lib/server/db-user-auth";
import { normalizeAppBaseUrl } from "@/lib/server/stripe-config";

export const runtime = "nodejs";

export async function POST() {
  try {
    const auth = await getAuthenticatedDbUser();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const customerId = auth.user.stripeCustomerId?.trim();
    if (!customerId) {
      return NextResponse.json(
        {
          error:
            "No Stripe customer on file yet. Subscribe on the Pricing page first.",
        },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const base = normalizeAppBaseUrl();

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${base}/workspace`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: unknown) {
    console.error("[billing/portal]", e);
    const message =
      e instanceof Error ? e.message : "Could not open billing portal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
