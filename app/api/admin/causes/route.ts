import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { listPendingCauses, setCauseStatus } from "@/lib/suggestions";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const pending = await listPendingCauses();
  return NextResponse.json({ pending });
}

export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id, action } = (await req.json()) as { id?: string; action?: "approve" | "reject" };
  if (!id || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const ok = await setCauseStatus(id, action === "approve" ? "approved" : "rejected");
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
