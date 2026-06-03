import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { listPendingPhotos, setPhotoApproval } from "@/lib/members";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const pending = await listPendingPhotos();
  return NextResponse.json({ pending });
}

export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { number, action } = (await req.json()) as { number?: number; action?: "approve" | "reject" };
  if (typeof number !== "number" || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const ok = await setPhotoApproval(number, action === "approve");
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
