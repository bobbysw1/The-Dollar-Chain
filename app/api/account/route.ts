import { NextRequest, NextResponse } from "next/server";
import { getCurrentMemberNumber } from "@/lib/session";
import { getMemberByNumber, updateMember } from "@/lib/members";
import { listActiveCauses } from "@/lib/causes";
import { validateAllocations, type Allocation, type PersonAppearance } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const n = getCurrentMemberNumber();
  if (!n) return NextResponse.json({ authenticated: false });
  const member = await getMemberByNumber(n);
  if (!member) return NextResponse.json({ authenticated: false });
  const causes = await listActiveCauses();
  return NextResponse.json({ authenticated: true, member, causes });
}

export async function PATCH(req: NextRequest) {
  const n = getCurrentMemberNumber();
  if (!n) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const body = (await req.json()) as {
    displayName?: string;
    city?: string;
    dedicatedSuburb?: string;
    notify?: boolean;
    avatar?: PersonAppearance;
    autoAllocate?: boolean;
    allocations?: Allocation[];
  };

  const patch: Record<string, unknown> = {};
  if (typeof body.displayName === "string") patch.displayName = body.displayName.slice(0, 40);
  if (typeof body.city === "string") patch.city = body.city.slice(0, 60);
  if (typeof body.dedicatedSuburb === "string") patch.dedicatedSuburb = body.dedicatedSuburb;
  if (typeof body.notify === "boolean") patch.notify = body.notify;
  if (body.avatar) patch.avatar = body.avatar;

  if (typeof body.autoAllocate === "boolean") {
    patch.autoAllocate = body.autoAllocate;
  }

  if (body.allocations) {
    // Only validate manual allocations when not on auto-allocate.
    const auto = body.autoAllocate ?? false;
    if (!auto) {
      const check = validateAllocations(body.allocations);
      if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 400 });
    }
    patch.allocations = body.allocations;
  }

  const updated = await updateMember(n, patch);
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ member: updated });
}
