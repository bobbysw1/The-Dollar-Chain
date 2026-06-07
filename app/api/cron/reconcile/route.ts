import { NextRequest, NextResponse } from "next/server";
import { STRIPE_CONFIGURED } from "@/lib/stripe";
import { reconcileAllMembersFromStripe } from "@/lib/members";

export const dynamic = "force-dynamic";
// Reconciliation can touch many Stripe invoices; give it room.
export const maxDuration = 60;

/**
 * Scheduled safety-net: recompute every member's contribution from Stripe so
 * nobody is ever stuck at $0, with no button to press. The webhook records
 * payments in real time; this catches anything it missed and backfills
 * historical records. Idempotent — it writes absolute totals, never adds.
 *
 * Triggered by Vercel Cron (see vercel.json). Vercel automatically sends
 * `Authorization: Bearer ${CRON_SECRET}` when that env var is set; if it isn't
 * set the endpoint stays open (safe — it takes no input and only mirrors
 * Stripe). Setting CRON_SECRET in Vercel is recommended.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!STRIPE_CONFIGURED) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

  try {
    const results = await reconcileAllMembersFromStripe();
    // Count only — no per-member amounts in the response.
    return NextResponse.json({ ok: true, reconciled: results.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "reconcile_failed";
    console.error("Cron reconcile failed", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
