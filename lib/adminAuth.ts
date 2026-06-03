import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const ADMIN_COOKIE = "dc_admin";

/** Must match the token minted in /api/admin/login. */
function adminToken(secret: string): string {
  return createHmac("sha256", secret).update("admin-v1").digest("base64url");
}

/** True when the current request carries a valid admin session cookie.
 *  Used to guard /api/admin/* routes (middleware only covers the /admin pages). */
export function isAdmin(): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const expected = adminToken(process.env.SESSION_SECRET || password);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
