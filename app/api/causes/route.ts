import { NextResponse } from "next/server";
import { listActiveCauses } from "@/lib/causes";

export const dynamic = "force-dynamic";

export async function GET() {
  const causes = await listActiveCauses();
  return NextResponse.json({ causes });
}
