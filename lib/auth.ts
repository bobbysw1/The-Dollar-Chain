import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "dc_session";
const MAX_AGE_DAYS = 365;

function secret() {
  return process.env.SESSION_SECRET || "dev-only-secret-do-not-use-in-prod";
}

interface Payload { n: number; iat: number }

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function createSessionToken(memberNumber: number): string {
  const payload: Payload = { n: memberNumber, iat: Date.now() };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined): number | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    return typeof payload.n === "number" ? payload.n : null;
  } catch { return null; }
}

export const SESSION_COOKIE = COOKIE;
export const SESSION_MAX_AGE = 60 * 60 * 24 * MAX_AGE_DAYS;
