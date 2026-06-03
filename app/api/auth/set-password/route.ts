import { NextRequest, NextResponse } from "next/server";
import { getCurrentMemberNumber } from "@/lib/session";
import { setMemberPassword, getMemberByNumber } from "@/lib/members";
import { hashPassword, passwordIssue } from "@/lib/password";

/** Sets the password for the currently signed-in member (used right after donating). */
export async function POST(req: NextRequest) {
  const n = getCurrentMemberNumber();
  if (!n) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const { password } = (await req.json()) as { password?: string };
  const issue = passwordIssue(password ?? "");
  if (issue) return NextResponse.json({ error: issue }, { status: 400 });

  const hash = await hashPassword(password!);
  const updated = await setMemberPassword(n, hash);
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const member = await getMemberByNumber(n);
  return NextResponse.json({ ok: true, email: member?.email });
}
