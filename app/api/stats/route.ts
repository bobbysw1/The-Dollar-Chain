import { NextResponse } from "next/server";
import { getPublicStats } from "@/lib/members";
import { MOCK_PROJECTS } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await getPublicStats();
  const deployedCents = MOCK_PROJECTS.reduce((s, p) => s + p.amountCents, 0);
  return NextResponse.json({
    totalMembers: stats.total,
    activeMembers: stats.active,
    nextNumber: stats.nextNumber,
    raisedCents: stats.contributedCents,           // what members have put in so far
    deployedCents,                                 // paid out to causes (0 until we fund)
    balanceCents: stats.contributedCents - deployedCents,
    peopleHelped: MOCK_PROJECTS.length,
    suburbsBacked: stats.suburbsBacked,
  });
}
