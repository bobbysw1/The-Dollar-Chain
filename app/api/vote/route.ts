import { NextRequest, NextResponse } from "next/server";
import { getCurrentMemberNumber } from "@/lib/session";
import { burnCredit, getCredits } from "@/lib/credits";
import { recordCategoryVote, memberHasVotedThisWeek, getVotes } from "@/lib/votes";
import { upvoteSuggestion } from "@/lib/suggestions";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const memberNumber = getCurrentMemberNumber();
  if (!memberNumber) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const body = (await req.json()) as
    | { kind: "category"; category: "Shelter" | "Food" | "Rent" }
    | { kind: "suggestion"; id: string };

  if (body.kind === "category") {
    const already = await memberHasVotedThisWeek(memberNumber);
    if (already) return NextResponse.json({ error: "already_voted", voted: already }, { status: 409 });
    if (!(await burnCredit(memberNumber))) {
      return NextResponse.json({ error: "no_credits" }, { status: 402 });
    }
    const r = await recordCategoryVote(body.category, memberNumber);
    if (!r.ok) return NextResponse.json({ error: r.reason }, { status: 409 });
    return NextResponse.json({ ok: true, credits: await getCredits(memberNumber) });
  }

  if (body.kind === "suggestion") {
    if (!(await burnCredit(memberNumber))) {
      return NextResponse.json({ error: "no_credits" }, { status: 402 });
    }
    const r = await upvoteSuggestion(body.id, memberNumber);
    if (!r.ok) return NextResponse.json({ error: r.reason }, { status: 409 });
    return NextResponse.json({ ok: true, credits: await getCredits(memberNumber), suggestion: r.suggestion });
  }

  return NextResponse.json({ error: "invalid_kind" }, { status: 400 });
}

export async function GET() {
  const votes = await getVotes();
  return NextResponse.json({ counts: votes.counts, weekEndsAt: votes.weekEndsAt });
}
