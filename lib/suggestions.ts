import { readJSON, writeJSON, withLock } from "./store";
import type { ProjectCategory } from "./types";

const FILE = "suggestions.json";

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
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

async function load(): Promise<SuggestionsFile> {
  return readJSON<SuggestionsFile>(FILE, { items: SEED });
}

export async function listSuggestions(): Promise<Suggestion[]> {
  const file = await load();
  return [...file.items].sort((a, b) => b.votes - a.votes);
}

export async function addSuggestion(input: {
  title: string;
  description: string;
  category: ProjectCategory;
  suggestedBy: number;
}): Promise<Suggestion> {
  return withLock(FILE, async () => {
    const file = await load();
    const item: Suggestion = {
      id: `s-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      ...input,
      createdAt: new Date().toISOString(),
      votes: 0,
      voters: [],
    };
    file.items.unshift(item);
    await writeJSON(FILE, file);
    return item;
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
