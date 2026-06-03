/**
 * Dev-only: lets you pretend to be member #N and (optionally) grant yourself credits
 * so you can test the voting UI without Stripe wired up.
 * Disabled in production.
 */
import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { grantCredit } from "@/lib/credits";
import { ensureDevMember } from "@/lib/members";

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Disabled in production" }, { status: 403 });
  }
  const { memberNumber, credits = 1 } = (await req.json()) as { memberNumber: number; credits?: number };
  if (!memberNumber || memberNumber < 1) {
    return NextResponse.json({ error: "Invalid memberNumber" }, { status: 400 });
  }
  // Make sure a member record exists so the account page works without Stripe.
  await ensureDevMember(memberNumber);
  // Grant N synthetic credits, each with a unique event id
  for (let i = 0; i < credits; i++) {
    await grantCredit(memberNumber, `dev-${memberNumber}-${Date.now()}-${i}`);
  }
  const token = createSessionToken(memberNumber);
  const res = NextResponse.json({ ok: true, memberNumber, credits });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: SESSION_MAX_AGE,
  });
  return res;
}
