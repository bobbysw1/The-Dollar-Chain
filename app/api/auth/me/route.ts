import { NextResponse } from "next/server";
import { getCurrentMemberNumber } from "@/lib/session";
import { getMemberByNumber } from "@/lib/members";
import { getCredits, getWeekEndsAt } from "@/lib/credits";
import { memberHasVotedThisWeek } from "@/lib/votes";

export const dynamic = "force-dynamic";

export async function GET() {
  const n = getCurrentMemberNumber();
  if (!n) return NextResponse.json({ authenticated: false });
  const [member, credits, weekEndsAt, votedFor] = await Promise.all([
    getMemberByNumber(n),
    getCredits(n),
    getWeekEndsAt(),
    memberHasVotedThisWeek(n),
  ]);
  return NextResponse.json({
    authenticated: true,
    memberNumber: n,
    member,
    credits,
    weekEndsAt,
    votedThisWeek: votedFor,
  });
}
