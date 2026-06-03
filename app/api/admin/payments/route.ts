import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { stripe, STRIPE_CONFIGURED } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!STRIPE_CONFIGURED) return NextResponse.json({ configured: false, payments: [] });

  try {
    const charges = await stripe().charges.list({ limit: 50, expand: ["data.balance_transaction"] });
    const payments = charges.data.map((c) => {
      const bt = c.balance_transaction;
      const fee = bt && typeof bt !== "string" ? bt.fee : null;
      const net = bt && typeof bt !== "string" ? bt.net : null;
      return {
        id: c.id,
        amount: c.amount,
        fee,
        net,
        currency: (c.currency || "aud").toUpperCase(),
        status: c.status,
        refunded: c.refunded,
        created: c.created,
        email: c.billing_details?.email ?? c.receipt_email ?? null,
        method: c.payment_method_details?.type ?? null,
      };
    });
    const totals = payments.reduce(
      (acc, p) => {
        if (p.status === "succeeded" && !p.refunded) {
          acc.gross += p.amount;
          acc.fee += p.fee ?? 0;
          acc.net += p.net ?? 0;
        }
        return acc;
      },
      { gross: 0, fee: 0, net: 0 }
    );
    return NextResponse.json({ configured: true, payments, totals });
  } catch (e) {
    return NextResponse.json({ configured: true, payments: [], error: e instanceof Error ? e.message : "stripe_error" });
  }
}
