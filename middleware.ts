import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "dc_admin";

function base64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Edge-safe HMAC, must match the Node version in /api/admin/login. */
async function expectedAdminToken(secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("admin-v1"));
  return base64url(new Uint8Array(sig));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only the admin area is gated. The login page itself stays open.
  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  const passwordConfigured = !!process.env.ADMIN_PASSWORD;

  // If no admin password is set: allow in dev (so you can see the page),
  // but never expose admin in production.
  if (!passwordConfigured || !secret) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.redirect(new URL("/admin/login?error=not_configured", req.url));
    }
    return NextResponse.next();
  }

  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  const ok = cookie && cookie === (await expectedAdminToken(secret));
  if (!ok) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
