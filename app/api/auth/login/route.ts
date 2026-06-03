import { NextRequest, NextResponse } from "next/server";
import { getMemberByEmail } from "@/lib/members";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = (await req.json()) as { email?: string; password?: string };
  if (!email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }
  const member = await getMemberByEmail(email.trim());
  // Generic message so we don't reveal which emails exist.
  if (!member || !member.passwordHash) {
    return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
  }
  if (!(await verifyPassword(password, member.passwordHash))) {
    return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
  }

  const token = createSessionToken(member.number);
  const res = NextResponse.json({ ok: true, memberNumber: member.number });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
