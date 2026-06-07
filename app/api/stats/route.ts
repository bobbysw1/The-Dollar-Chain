import { NextResponse } from "next/server";
import { getPublicStats, getSuburbTotals } from "@/lib/members";
import { MOCK_PROJECTS } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const [stats, suburbs] = await Promise.all([getPublicStats(), getSuburbTotals()]);
  const deployedCents = MOCK_PROJECTS.reduce((s, p) => s + p.amountCents, 0);
  return NextResponse.json({
    totalMembers: stats.total,
    activeMembers: stats.active,
    nextNumber: stats.nextNumber,
    donatedCents: stats.donatedCents,              // gross — what members actually paid
    feeCents: stats.feeCents,                       // Stripe's total cut
    raisedCents: stats.contributedCents,           // NET — what's really in the fund after fees
    deployedCents,                                 // paid out to causes (0 until we fund)
    balanceCents: stats.contributedCents - deployedCents,
    peopleHelped: MOCK_PROJECTS.length,
    suburbsBacked: stats.suburbsBacked,
    suburbs,                                       // slug -> { members, raisedCents, donatedCents }
  });
}
