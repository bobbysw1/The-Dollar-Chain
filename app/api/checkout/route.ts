import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, priceIdFor, siteUrl, STRIPE_CONFIGURED } from "@/lib/stripe";
import { type PaymentMethod, type Plan, type Tier, type PersonAppearance } from "@/lib/types";

const VALID_PLANS: Plan[] = ["weekly", "monthly", "quarterly", "biannual", "annual"];
const STRIPE_PRODUCT_ID = process.env.STRIPE_PRODUCT_ID || "prod_UdJFAKZWqhgTdK";

export async function POST(req: NextRequest) {
  if (!STRIPE_CONFIGURED) {
    return NextResponse.json({ error: "Stripe is not configured. Set STRIPE_SECRET_KEY in .env.local" }, { status: 503 });
  }

  const body = (await req.json()) as {
    plan: Plan;
    email: string;
    paymentMethod?: PaymentMethod;
    tier?: Tier;
    dedicatedSuburb?: string;
    displayName?: string;
    city?: string;
    avatar?: PersonAppearance;
    referredByCode?: string;
    customWeeklyCents?: number;
  };
  const { email } = body;
  const paymentMethod: PaymentMethod = body.paymentMethod === "becs" ? "becs" : "card";
  const tier: Tier = body.tier === "boosted" ? "boosted" : "standard";
  const dedicatedSuburb = body.dedicatedSuburb || "palm-beach";

  // A custom "give more" amount overrides the plan — billed weekly.
  const customWeekly = typeof body.customWeeklyCents === "number" && body.customWeeklyCents >= 100
    ? Math.min(Math.round(body.customWeeklyCents), 100000) // cap at $1000/week sanity guard
    : 0;
  const plan: Plan = customWeekly ? "weekly" : body.plan;

  if (!email || !VALID_PLANS.includes(plan)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Stripe metadata values must be strings; avatar is JSON-encoded (small).
  // Keep the photo URL out of the avatar JSON (URLs are long) — its own key.
  const { photoUrl, ...avatarRest } = body.avatar ?? {};
  const metadata: Record<string, string> = {
    plan, paymentMethod, tier, dedicatedSuburb,
    displayName: (body.displayName ?? "").slice(0, 40),
    city: (body.city ?? "").slice(0, 60),
    avatar: JSON.stringify(avatarRest).slice(0, 480),
    photoUrl: (photoUrl ?? "").slice(0, 480),
    referredByCode: (body.referredByCode ?? "").slice(0, 12),
    customWeeklyCents: String(customWeekly),
  };

  // BECS Direct Debit requires AUD. Card works out of the box.
  const payment_method_types: ("card" | "au_becs_debit")[] =
    paymentMethod === "becs" ? ["au_becs_debit"] : ["card"];

  try {
    // Custom amount → an inline weekly price; otherwise a pre-made plan price.
    const line_items: Stripe.Checkout.SessionCreateParams["line_items"] = customWeekly
      ? [{ price_data: { currency: "aud", unit_amount: customWeekly, recurring: { interval: "week" }, product: STRIPE_PRODUCT_ID }, quantity: 1 }]
      : [{ price: priceIdFor(plan, tier), quantity: 1 }];

    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types,
      line_items,
      customer_email: email,
      // save_default_payment_method keeps the card on file for future renewals.
      subscription_data: { metadata },
      payment_method_collection: "always",
      metadata,
      success_url: `${siteUrl()}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/join?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Surface the real reason (e.g. "au_becs_debit is not activated for your
    // account", or a missing price env var) instead of letting the route 500
    // into a generic client-side "Network error".
    const message = err instanceof Error ? err.message : "Could not start checkout.";
    console.error("Checkout session create failed", { paymentMethod, plan, tier, message });
    const becsHint = paymentMethod === "becs"
      ? " If you're seeing this with Direct Debit, make sure BECS Direct Debit is activated on your Stripe account (Settings → Payment methods)."
      : "";
    return NextResponse.json({ error: `${message}${becsHint}` }, { status: 502 });
  }
}
