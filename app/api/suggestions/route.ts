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

  const body = (await req.json()) as { title: string; description?: string; category: ProjectCategory };
  if (!body.title?.trim()) return NextResponse.json({ error: "missing_title" }, { status: 400 });

  const item = await addSuggestion({
    title: body.title.trim().slice(0, 80),
    description: (body.description ?? "").trim().slice(0, 240),
    category: body.category,
    suggestedBy: memberNumber,
  });
  return NextResponse.json({ item });
}
