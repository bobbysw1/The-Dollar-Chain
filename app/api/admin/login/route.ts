import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

const ADMIN_COOKIE = "dc_admin";

/** Must match the Edge HMAC in middleware.ts. */
function adminToken(secret: string): string {
  return createHmac("sha256", secret).update("admin-v1").digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function POST(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.json({ error: "Admin password not configured. Set ADMIN_PASSWORD." }, { status: 503 });
  }
  const { password: submitted } = (await req.json()) as { password?: string };
  if (!submitted || !safeEqual(submitted, password)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const secret = process.env.SESSION_SECRET || password;
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });
  return res;
}
