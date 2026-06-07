import { readJSON, writeJSON, withLock } from "./store";
import type { ProjectCategory } from "./types";

const FILE = "suggestions.json";

export type CauseStatus = "pending" | "approved" | "rejected";

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  suburb?: string;
  /** Up to 3 uploaded image URLs. */
  images?: string[];
  /** Fundraising target in cents, if set. */
  targetCents?: number;
  /** Geotag (OpenStreetMap). */
  lat?: number;
  lng?: number;
  locationLabel?: string;
  /** Moderation state — members submit as "pending"; admin approves. */
  status: CauseStatus;
  suggestedBy: number;
  createdAt: string;
  votes: number;
  voters: number[]; // member numbers who upvoted
}

interface SuggestionsFile {
  items: Suggestion[];
}

// Start empty — real member submissions populate this.
const SEED: Suggestion[] = [];

/** Older saved items may predate the status field — treat them as approved. */
function normalise(s: Suggestion): Suggestion {
  return { ...s, status: s.status ?? "approved", images: s.images ?? [] };
}

async function load(): Promise<SuggestionsFile> {
  const file = await readJSON<SuggestionsFile>(FILE, { items: SEED });
  file.items = (file.items ?? []).map(normalise);
  return file;
}

/** Public list — APPROVED causes only, most-voted first. */
export async function listSuggestions(): Promise<Suggestion[]> {
  const file = await load();
  return file.items.filter((s) => s.status === "approved").sort((a, b) => b.votes - a.votes);
}

/** Admin: causes awaiting review, oldest first. */
export async function listPendingCauses(): Promise<Suggestion[]> {
  const file = await load();
  return file.items.filter((s) => s.status === "pending").sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getSuggestion(id: string): Promise<Suggestion | null> {
  const file = await load();
  return file.items.find((s) => s.id === id) ?? null;
}

export async function addSuggestion(input: {
  title: string;
  description: string;
  category: ProjectCategory;
  suburb?: string;
  images?: string[];
  targetCents?: number;
  lat?: number;
  lng?: number;
  locationLabel?: string;
  suggestedBy: number;
}): Promise<Suggestion> {
  return withLock(FILE, async () => {
    const file = await load();
    const item: Suggestion = {
      id: `s-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      title: input.title,
      description: input.description,
      category: input.category,
      suburb: input.suburb,
      images: (input.images ?? []).slice(0, 3),
      targetCents: input.targetCents,
      lat: input.lat,
      lng: input.lng,
      locationLabel: input.locationLabel,
      status: "pending",
      suggestedBy: input.suggestedBy,
      createdAt: new Date().toISOString(),
      votes: 0,
      voters: [],
    };
    file.items.unshift(item);
    await writeJSON(FILE, file);
    return item;
  });
}

/** Admin: approve or reject a submitted cause. */
export async function setCauseStatus(id: string, status: CauseStatus): Promise<boolean> {
  return withLock(FILE, async () => {
    const file = await load();
    const s = file.items.find((x) => x.id === id);
    if (!s) return false;
    s.status = status;
    await writeJSON(FILE, file);
    return true;
  });
}

export async function upvoteSuggestion(id: string, memberNumber: number): Promise<{ ok: boolean; suggestion?: Suggestion; reason?: string }> {
  return withLock(FILE, async () => {
    const file = await load();
    const s = file.items.find((x) => x.id === id);
    if (!s) return { ok: false, reason: "not_found" };
    if (s.voters.includes(memberNumber)) return { ok: false, reason: "already_voted", suggestion: s };
    s.voters.push(memberNumber);
    s.votes += 1;
    await writeJSON(FILE, file);
    return { ok: true, suggestion: s };
  });
}
