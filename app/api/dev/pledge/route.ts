import { NextRequest, NextResponse } from "next/server";
import { upsertMemberFromCheckout } from "@/lib/members";
import { grantCredit } from "@/lib/credits";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import type { Plan, PersonAppearance } from "@/lib/types";

/**
 * Dev only: simulate a successful $1 donation without Stripe, so the full
 * "donate → set password → log in" flow can be tested locally. Creates the
 * member, signs them in, and grants a vote credit — exactly what the real
 * Stripe success + webhook do. Disabled in production.
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Disabled in production" }, { status: 403 });
  }
  const body = (await req.json()) as {
    email: string; plan?: Plan; displayName?: string; city?: string;
    dedicatedSuburb?: string; avatar?: PersonAppearance; referredByCode?: string;
  };
  if (!body.email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const member = await upsertMemberFromCheckout({
    email: body.email.trim(),
    plan: body.plan ?? "weekly",
    displayName: body.displayName,
    city: body.city,
    dedicatedSuburb: body.dedicatedSuburb,
    avatar: body.avatar,
    referredByCode: body.referredByCode,
  });
  // Simulate the first successful payment.
  await grantCredit(member.number, `dev-pledge-${member.number}-${Date.now()}`);

  const token = createSessionToken(member.number);
  const res = NextResponse.json({ ok: true, memberNumber: member.number, redirect: `/join/welcome?n=${member.number}` });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: SESSION_MAX_AGE,
  });
  return res;
}
