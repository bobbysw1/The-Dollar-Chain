import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./auth";

export function getCurrentMemberNumber(): number | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}
