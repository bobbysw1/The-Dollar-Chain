import { NextResponse } from "next/server";
import { listPublicMembers, getPublicStats } from "@/lib/members";

export const dynamic = "force-dynamic";

export async function GET() {
  const [members, stats] = await Promise.all([listPublicMembers(), getPublicStats()]);
  return NextResponse.json({ members, stats });
}
