import { NextResponse } from "next/server";
import { stripe, siteUrl, STRIPE_CONFIGURED } from "@/lib/stripe";
import { getCurrentMemberNumber } from "@/lib/session";
import { getMemberByNumber } from "@/lib/members";

/**
 * Opens the Stripe Customer Portal so a member can update their saved card,
 * switch payment method, see invoices, or cancel — all handled by Stripe.
 */
export async function POST() {
  if (!STRIPE_CONFIGURED) {
    return NextResponse.json({ error: "Billing is not configured yet." }, { status: 503 });
  }
  const n = getCurrentMemberNumber();
  if (!n) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const member = await getMemberByNumber(n);
  if (!member?.stripeCustomerId) {
    return NextResponse.json({ error: "no_customer" }, { status: 400 });
  }

  const portal = await stripe().billingPortal.sessions.create({
    customer: member.stripeCustomerId,
    return_url: `${siteUrl()}/account`,
  });
  return NextResponse.json({ url: portal.url });
}
