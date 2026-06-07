import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { STRIPE_CONFIGURED } from "@/lib/stripe";
import { reconcileAllMembersFromStripe } from "@/lib/members";

export const dynamic = "force-dynamic";

/** Backfill every member's contribution from Stripe's record of paid invoices.
 *  Repairs historical $0 members (e.g. where the webhook didn't fire). Safe to
 *  re-run — it sets absolute totals, never adds. */
export async function POST() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!STRIPE_CONFIGURED) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

  try {
    const results = await reconcileAllMembersFromStripe();
    const totalCents = results.reduce((s, r) => s + r.contributedCents, 0);
    return NextResponse.json({ ok: true, reconciled: results.length, totalCents, results });
  } catch (e) {
    const message = e instanceof Error ? e.message : "reconcile_failed";
    console.error("Admin reconcile failed", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
