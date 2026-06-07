import { NextRequest, NextResponse } from "next/server";
import { getCurrentMemberNumber } from "@/lib/session";
import { addSuggestion, listSuggestions } from "@/lib/suggestions";
import type { ProjectCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await listSuggestions();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const memberNumber = getCurrentMemberNumber();
  if (!memberNumber) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const body = (await req.json()) as {
    title: string;
    description?: string;
    category: ProjectCategory;
    suburb?: string;
    images?: string[];
    targetCents?: number;
    lat?: number;
    lng?: number;
    locationLabel?: string;
  };
  if (!body.title?.trim()) return NextResponse.json({ error: "missing_title" }, { status: 400 });

  const validCoord = typeof body.lat === "number" && typeof body.lng === "number"
    && Math.abs(body.lat) <= 90 && Math.abs(body.lng) <= 180;

  const images = Array.isArray(body.images)
    ? body.images.filter((u) => typeof u === "string" && u.startsWith("http")).slice(0, 3)
    : [];
  const targetCents =
    typeof body.targetCents === "number" && body.targetCents > 0
      ? Math.min(Math.round(body.targetCents), 100_000_00) // cap at $100k
      : undefined;

  const item = await addSuggestion({
    title: body.title.trim().slice(0, 80),
    description: (body.description ?? "").trim().slice(0, 1200),
    category: body.category,
    suburb: body.suburb || undefined,
    images,
    targetCents,
    lat: validCoord ? body.lat : undefined,
    lng: validCoord ? body.lng : undefined,
    locationLabel: body.locationLabel ? body.locationLabel.trim().slice(0, 120) : undefined,
    suggestedBy: memberNumber,
  });
  return NextResponse.json({ item });
}
