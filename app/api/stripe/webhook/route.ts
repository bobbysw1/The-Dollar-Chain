import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getMemberByCustomerId, upsertMemberFromCheckout, updateMember, setMemberActive } from "@/lib/members";
import { grantCredit } from "@/lib/credits";
import type { Plan } from "@/lib/types";

export const runtime = "nodejs";
// Stripe requires the raw request body for signature verification.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const customerId = typeof s.customer === "string" ? s.customer : s.customer?.id;
        const subscriptionId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id;
        const email = s.customer_details?.email || s.customer_email;
        const plan = (s.metadata?.plan as Plan) || "weekly";
        if (customerId && subscriptionId && email) {
          await upsertMemberFromCheckout({ email, plan, stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const inv = event.data.object as Stripe.Invoice;
        const customerId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
        if (!customerId) break;
        const member = await getMemberByCustomerId(customerId);
        if (!member) break;
        // Credits = dollars donated this payment ($4/month → 4, $52/year → 52).
        // Event id keeps it idempotent.
        const paid = inv.amount_paid ?? 0;
        await grantCredit(member.number, event.id, Math.floor(paid / 100));

        // Capture Stripe's actual fee on this charge so our "raised" figure is
        // honest (net = what really lands in the fund). Fall back to an estimate.
        let feeCents = 0;
        try {
          const invCharge = (inv as unknown as { charge?: string | { id?: string } }).charge;
          const chargeId = typeof invCharge === "string" ? invCharge : invCharge?.id;
          if (chargeId) {
            const charge = await stripe().charges.retrieve(chargeId, { expand: ["balance_transaction"] });
            const bt = charge.balance_transaction;
            if (bt && typeof bt !== "string") feeCents = bt.fee ?? 0;
          }
        } catch { /* fall through to estimate */ }
        if (!feeCents) feeCents = Math.round((paid * 0.0175 + 30) * 1.1); // AU card estimate

        await updateMember(member.number, {
          contributedCents: member.contributedCents + paid,
          feeCents: (member.feeCents ?? 0) + feeCents,
          active: true,
        });
        break;
      }

      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const customerId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
        if (customerId) await setMemberActive(customerId, false);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        if (customerId) await setMemberActive(customerId, false);
        break;
      }
      case "customer.subscription.updated":
        break;
    }
  } catch (err) {
    console.error("Webhook handler error", err);
    return NextResponse.json({ error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
