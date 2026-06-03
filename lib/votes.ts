import { readJSON, writeJSON, withLock } from "./store";

const FILE = "votes.json";

type Category = "Shelter" | "Food" | "Rent";

interface VotesFile {
  weekEndsAt: string;
  counts: Record<Category, number>;
  voters: Record<Category, number[]>; // memberNumber per cat
}

function nextWeekEnd(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const daysUntilSunday = (7 - day) % 7 || 7;
  const end = new Date(now);
  end.setUTCDate(now.getUTCDate() + daysUntilSunday);
  end.setUTCHours(23, 59, 59, 0);
  return end.toISOString();
}

function empty(): VotesFile {
  return {
    weekEndsAt: nextWeekEnd(),
    counts: { Shelter: 0, Food: 0, Rent: 0 },
    voters: { Shelter: [], Food: [], Rent: [] },
  };
}

async function load(): Promise<VotesFile> {
  const file = await readJSON<VotesFile>(FILE, empty());
  if (new Date(file.weekEndsAt).getTime() < Date.now()) return empty();
  return file;
}

export async function getVotes(): Promise<VotesFile> {
  return load();
}

export async function recordCategoryVote(category: Category, memberNumber: number): Promise<{ ok: boolean; reason?: string }> {
  return withLock(FILE, async () => {
    const file = await load();
    const alreadyVoted = (Object.keys(file.voters) as Category[]).some((c) =>
      file.voters[c].includes(memberNumber)
    );
    if (alreadyVoted) return { ok: false, reason: "already_voted" };
    file.counts[category] += 1;
    file.voters[category].push(memberNumber);
    await writeJSON(FILE, file);
    return { ok: true };
  });
}

export async function memberHasVotedThisWeek(memberNumber: number): Promise<Category | null> {
  const file = await load();
  for (const c of ["Shelter", "Food", "Rent"] as Category[]) {
    if (file.voters[c].includes(memberNumber)) return c;
  }
  return null;
}
