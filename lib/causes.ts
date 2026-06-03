import type { ProjectCategory } from "./types";
import { listSuggestions } from "./suggestions";

/** A cause currently open for funding — something a member can put their $1 toward.
 *  Two sources: curated (picked by the team) and member (came in via suggestions). */
export interface Cause {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  suburb?: string;        // slug, if tied to a suburb
  source: "curated" | "member";
  suggestedBy?: number;   // member number, for member-submitted
  targetCents?: number;
  raisedCents?: number;
  votes?: number;
}

/** Team-curated active causes. These are the "ones we feel are relevant". */
export const CURATED_CAUSES: Cause[] = [
  {
    id: "c-shelter-pool",
    title: "Emergency shelter fund",
    description: "A standing pot for same-night motel and crisis-bed stays across the southern Gold Coast. These are the standing causes we think the chain will care about most.",
    category: "Shelter",
    source: "curated",
    targetCents: 200000, raisedCents: 0,
  },
  {
    id: "c-food-relief",
    title: "Weekly food relief",
    description: "Tops up partner community pantries in Burleigh, Palm Beach and Coolangatta. Predictable, every week, no drama.",
    category: "Food",
    source: "curated",
    targetCents: 150000, raisedCents: 0,
  },
  {
    id: "c-rent-bridge",
    title: "Rent bridging",
    description: "One-off payments that stop an eviction during a short gap — between jobs, waiting on Centrelink, a bad fortnight.",
    category: "Rent",
    source: "curated",
    targetCents: 180000, raisedCents: 0,
  },
  {
    id: "c-beach-care",
    title: "Beach & foreshore care",
    description: "Gloves, bags, sharps bins and a coffee run for the volunteer crews keeping our beaches and dunes clean.",
    category: "Beach Cleanup",
    source: "curated",
    targetCents: 60000, raisedCents: 0,
  },
  {
    id: "c-elderly-yards",
    title: "Yard care for elderly neighbours",
    description: "Mowing and clean-ups for residents who physically can't manage it and can't afford a contractor.",
    category: "Mowing",
    source: "curated",
    targetCents: 50000, raisedCents: 0,
  },
  {
    id: "c-youth-sport",
    title: "Get a kid to the comp",
    description: "Travel, entry fees and kit so local kids who qualify don't miss out for the cost of a flight or a jersey.",
    category: "Youth Sport",
    source: "curated",
    targetCents: 120000, raisedCents: 0,
  },
  {
    id: "c-where-needed",
    title: "Where it's needed most",
    description: "Don't want to choose? This goes into the general pot and follows the weekly vote. The default for auto-allocate.",
    category: "Other",
    source: "curated",
  },
];

export const AUTO_ALLOCATE_CAUSE_ID = "c-where-needed";

/** All causes available for allocation: curated + member-submitted (from suggestions). */
export async function listActiveCauses(): Promise<Cause[]> {
  const suggestions = await listSuggestions();
  const memberCauses: Cause[] = suggestions.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    category: s.category,
    source: "member",
    suggestedBy: s.suggestedBy,
    votes: s.votes,
  }));
  return [...CURATED_CAUSES, ...memberCauses];
}

export async function getCause(id: string): Promise<Cause | null> {
  const all = await listActiveCauses();
  return all.find((c) => c.id === id) ?? null;
}
