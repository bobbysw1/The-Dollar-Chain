import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!_stripe) _stripe = new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
  return _stripe;
}

import type { Plan } from "./types";
type TierKey = "standard" | "boosted";

export function priceIdFor(plan: Plan, tier: TierKey = "standard"): string {
  const upperPlan = plan.toUpperCase().replace(/-/g, "_");
  const envKey = tier === "boosted"
    ? `STRIPE_PRICE_${upperPlan}_BOOST`
    : `STRIPE_PRICE_${upperPlan}`;
  const id = process.env[envKey];
  if (!id) throw new Error(`Missing ${envKey} in env`);
  return id;
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export const STRIPE_CONFIGURED = !!process.env.STRIPE_SECRET_KEY;
