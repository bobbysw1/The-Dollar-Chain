import { NextRequest, NextResponse } from "next/server";
import { stripe, siteUrl } from "@/lib/stripe";
import { upsertMemberFromCheckout } from "@/lib/members";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) return NextResponse.redirect(`${siteUrl()}/join?error=missing_session`);

  const session = await stripe().checkout.sessions.retrieve(sessionId, {
    expand: ["customer", "subscription"],
  });

  const email = session.customer_details?.email || (session.customer_email ?? "");
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  const m = session.metadata ?? {};
  const plan = (m.plan as import("@/lib/types").Plan) || "weekly";

  if (!email || !customerId || !subscriptionId) {
    return NextResponse.redirect(`${siteUrl()}/join?error=incomplete`);
  }

  let avatar: import("@/lib/types").PersonAppearance | undefined;
  try {
    const parsed = m.avatar ? JSON.parse(m.avatar) : null;
    if (parsed && parsed.skinTone) {
      avatar = parsed;
      if (m.photoUrl) { avatar!.photoUrl = m.photoUrl; avatar!.photoStatus = "pending"; }
    }
  } catch { /* ignore malformed avatar */ }

  const member = await upsertMemberFromCheckout({
    email, plan, stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId,
    displayName: m.displayName || undefined,
    city: m.city || undefined,
    dedicatedSuburb: m.dedicatedSuburb || undefined,
    avatar,
    referredByCode: m.referredByCode || undefined,
  });

  const token = createSessionToken(member.number);
  const res = NextResponse.redirect(`${siteUrl()}/join/welcome?n=${member.number}`);
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
