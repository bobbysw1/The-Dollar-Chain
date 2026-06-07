import { RUNNING_COST_PCT } from "./fund";

export type SkinTone = string;
export type HairStyle = "short" | "long" | "curly" | "bun" | "buzz" | "none";
export type Accessory = "cap" | "beanie" | "glasses" | "sunglasses" | "bow" | "earrings" | "moustache" | "freckles";
export type Build = "slim" | "regular" | "broad";
export type PhotoStatus = "pending" | "approved";
/** Where an uploaded photo sits on the figure, and the crop shape used. */
export type PhotoPlacement = "head" | "torso" | "full";
export type PhotoShape = "circle" | "square";
export const PHOTO_PLACEMENTS: PhotoPlacement[] = ["head", "torso", "full"];
export const PHOTO_PLACEMENT_LABELS: Record<PhotoPlacement, string> = {
  head: "Face",
  torso: "Torso",
  full: "Full body",
};
/** Every plan is the SAME commitment — $1 a week = $52 a year. The only choice
 *  is how often Stripe charges you. Fewer charges = fewer fixed ~30¢ fees = more
 *  reaches the causes. */
export type Plan = "weekly" | "monthly" | "quarterly" | "biannual" | "annual";

export type PaymentMethod = "card" | "becs";
export type Tier = "standard" | "boosted";

/** The whole-year commitment every plan adds up to. */
export const ANNUAL_TOTAL_CENTS = 5200; // $52 / year

/** How a member's $1 is divided across causes. pct is 0–100; each entry must be
 *  >= 20 (i.e. min $0.20 of a $1), at most 5 entries, and the set must sum to 100. */
export interface Allocation {
  causeId: string;
  pct: number;
}

export const MIN_ALLOCATION_PCT = 20; // $0.20 of a $1
export const MAX_ALLOCATION_SLICES = 100 / MIN_ALLOCATION_PCT; // = 5

export function validateAllocations(allocs: Allocation[]): { ok: boolean; reason?: string } {
  if (allocs.length === 0) return { ok: false, reason: "Pick at least one cause." };
  if (allocs.length > MAX_ALLOCATION_SLICES) return { ok: false, reason: `Up to ${MAX_ALLOCATION_SLICES} causes ($0.20 minimum each).` };
  if (allocs.some((a) => a.pct < MIN_ALLOCATION_PCT)) return { ok: false, reason: `Each cause needs at least $0.20 (${MIN_ALLOCATION_PCT}%).` };
  const sum = allocs.reduce((s, a) => s + a.pct, 0);
  if (sum !== 100) return { ok: false, reason: `Slices must add up to $1.00 — currently $${(sum / 100).toFixed(2)}.` };
  return { ok: true };
}

export interface PlanMeta {
  id: Plan;
  label: string;            // e.g. "$1 / week"
  unit: string;             // e.g. "week" — for "/week" suffixes
  chargeCents: number;      // amount per charge, standard tier
  boostedChargeCents: number; // amount per charge, boosted (covers the fee)
  boostedLabel: string;     // e.g. "$1.30 / week"
  interval: "week" | "month" | "year"; // Stripe recurring interval
  intervalCount: number;    // Stripe interval_count (e.g. 2 = fortnightly)
  chargesPerYear: number;   // how many times you're charged per year
  annualCents: number;      // always $52
  cardFeeCents: number;     // fee per charge (card)
  becsFeeCents: number;     // fee per charge (BECS)
  blurb: string;
  recommended?: boolean;
}

/** Stripe AU fees per charge (incl. 10% GST):
 *  card = 1.75% + 30¢ ; BECS = 1% + 30¢ capped at $3.50. */
function cardFeeCents(amount: number): number {
  return Math.round((amount * 0.0175 + 30) * 1.1);
}
function becsFeeCents(amount: number): number {
  return Math.round(Math.min(amount * 0.01 + 30, 350) * 1.1);
}

/** Roughly a dollar a week, billed however suits you. The "boosted" amount is
 *  just +30¢ — covering Stripe's fixed fee so it comes out of the giver's pocket,
 *  not the cause's. Weekly & monthly are flagged as the popular picks. */
export const PLANS: PlanMeta[] = [
  {
    id: "weekly", label: "$1 / week", unit: "week",
    chargeCents: 100, boostedChargeCents: 130, boostedLabel: "$1.30 / week",
    interval: "week", intervalCount: 1, chargesPerYear: 52, annualCents: 5200,
    cardFeeCents: cardFeeCents(100), becsFeeCents: becsFeeCents(100),
    blurb: "A dollar a week — true to the name.",
    recommended: true,
  },
  {
    id: "monthly", label: "$4 / month", unit: "month",
    chargeCents: 400, boostedChargeCents: 430, boostedLabel: "$4.30 / month",
    interval: "month", intervalCount: 1, chargesPerYear: 12, annualCents: 4800,
    cardFeeCents: cardFeeCents(400), becsFeeCents: becsFeeCents(400),
    blurb: "About a coffee a month.",
    recommended: true,
  },
  {
    id: "quarterly", label: "$12 / quarter", unit: "quarter",
    chargeCents: 1200, boostedChargeCents: 1230, boostedLabel: "$12.30 / quarter",
    interval: "month", intervalCount: 3, chargesPerYear: 4, annualCents: 4800,
    cardFeeCents: cardFeeCents(1200), becsFeeCents: becsFeeCents(1200),
    blurb: "Four times a year.",
  },
  {
    id: "biannual", label: "$26 / 6 months", unit: "6 months",
    chargeCents: 2600, boostedChargeCents: 2630, boostedLabel: "$26.30 / 6 months",
    interval: "month", intervalCount: 6, chargesPerYear: 2, annualCents: 5200,
    cardFeeCents: cardFeeCents(2600), becsFeeCents: becsFeeCents(2600),
    blurb: "Twice a year.",
  },
  {
    id: "annual", label: "$52 / year", unit: "year",
    chargeCents: 5200, boostedChargeCents: 5230, boostedLabel: "$52.30 / year",
    interval: "year", intervalCount: 1, chargesPerYear: 1, annualCents: 5200,
    cardFeeCents: cardFeeCents(5200), becsFeeCents: becsFeeCents(5200),
    blurb: "Once a year — fewest fees of all.",
  },
];

/** All plans now offer the +30¢ fee-cover. */
export const planHasBoost = (_p: PlanMeta) => true;

/** Resolve the charge for a plan + tier (falls back to standard if no boost). */
export const chargeFor = (p: PlanMeta, t: Tier) =>
  t === "boosted" && planHasBoost(p) ? p.boostedChargeCents : p.chargeCents;

export const feeForAmount = (amountCents: number, m: PaymentMethod) =>
  m === "card" ? cardFeeCents(amountCents) : becsFeeCents(amountCents);

export const feeFor = (p: PlanMeta, m: PaymentMethod) =>
  m === "card" ? p.cardFeeCents : p.becsFeeCents;

/** Dollars from one charge that actually reach causes: after the processing
 *  fee, then after the 10% it costs to run the site. */
export const toCausesCents = (chargeCents: number, feeCents: number) =>
  Math.max(0, Math.round((chargeCents - feeCents) * (1 - RUNNING_COST_PCT)));

/** % of your donation that reaches causes — after the payment fee AND the 10%
 *  running cost. Covering the fee is defined as landing your *full* donation in
 *  the fund, so a covered charge is a clean "100% in the fund − 10% running
 *  costs = 90% to causes" regardless of the payment method. */
export const keepPct = (p: PlanMeta, m: PaymentMethod, t: Tier = "standard") => {
  const base = p.chargeCents; // the donation the giver thinks of as "theirs"
  const charge = chargeFor(p, t);
  const fee = feeForAmount(charge, m);
  // What lands in the fund relative to the base donation. Covering the fee is
  // meant to land the whole donation, so we cap at the base (never >100%).
  const inFund = t === "boosted" ? base : Math.min(base, charge - fee);
  const toCauses = inFund * (1 - RUNNING_COST_PCT);
  return Math.round((toCauses / base) * 100);
};

export const planMetaFor = (id: Plan) => PLANS.find((p) => p.id === id)!;

export const SKIN_TONES: string[] = ["#FDDBB4", "#F5CBA7", "#C68642", "#8D5524", "#4A2912"];
export const HAIR_COLOURS: string[] = ["#1C1C1C", "#3D2817", "#8B5A2B", "#C97B37", "#E8B86B", "#D4D4D8"];
export const SHIRT_COLOURS: string[] = [
  "#2563EB", "#DC2626", "#16A34A", "#F59E0B",
  "#7C3AED", "#0891B2", "#DB2777", "#0A0A0A",
];
export const HAIR_STYLES: HairStyle[] = ["short", "buzz", "long", "curly", "bun", "none"];
export const ACCESSORIES: Accessory[] = ["cap", "beanie", "glasses", "sunglasses", "bow", "earrings", "moustache", "freckles"];
export const BUILDS: Build[] = ["slim", "regular", "broad"];
export const ACCESSORY_LABELS: Record<Accessory, string> = {
  cap: "Cap", beanie: "Beanie", glasses: "Glasses", sunglasses: "Sunnies",
  bow: "Bow", earrings: "Earrings", moustache: "Moustache", freckles: "Freckles",
};
export const BUILD_LABELS: Record<Build, string> = { slim: "Slim", regular: "Regular", broad: "Broad" };

export interface PersonAppearance {
  skinTone: string;
  shirtColour: string;
  hairColour: string;
  hairStyle: HairStyle;
  build: Build;
  accessories: Accessory[];
  /** Optional uploaded photo. Shown publicly only once approved. */
  photoUrl?: string;
  photoStatus?: PhotoStatus;
  /** Where the photo sits on the figure (defaults to "full" for older photos). */
  photoPlacement?: PhotoPlacement;
  /** Crop shape baked into the image (circle for faces, square otherwise). */
  photoShape?: PhotoShape;
}

export interface ChainMember extends PersonAppearance {
  number: number;
  displayName?: string;
  city?: string;
  joinedAt: string;
  isActive: boolean;
  contributedCents: number;
  plan: Plan;
  projectsHelped: string[];
}

export type ProjectCategory =
  | "Shelter"
  | "Rent"
  | "Food"
  | "Utilities"
  | "Security"
  | "Beach Cleanup"
  | "Mowing"
  | "Painting"
  | "Potholes"
  | "Social Work"
  | "Repairs"
  | "Transport"
  | "Medical"
  | "Education"
  | "Youth Sport"
  | "Arts & Culture"
  | "Environment"
  | "Wildlife"
  | "Parks"
  | "Personal"
  | "Other";

export interface FundedProject {
  id: string;
  date: string;
  category: ProjectCategory;
  title: string;
  description: string;
  amountCents: number;
  fundedByRange: [number, number];
  quote?: string;
  isCurrent?: boolean;
}

export const CATEGORY_COLOURS: Record<ProjectCategory, string> = {
  Shelter: "#2563EB",
  Rent: "#7C3AED",
  Food: "#16A34A",
  Utilities: "#F59E0B",
  Security: "#DC2626",
  "Beach Cleanup": "#06B6D4",
  Mowing: "#65A30D",
  Painting: "#EA580C",
  Potholes: "#525252",
  "Social Work": "#DB2777",
  Repairs: "#9333EA",
  Transport: "#0EA5E9",
  Medical: "#E11D48",
  Education: "#0D9488",
  "Youth Sport": "#F97316",
  "Arts & Culture": "#A855F7",
  Environment: "#0F9D8E",
  Wildlife: "#B45309",
  Parks: "#4D7C0F",
  Personal: "#EC4899",
  Other: "#71717A",
};

export const ALL_CATEGORIES: ProjectCategory[] = [
  "Shelter", "Rent", "Food", "Utilities", "Security",
  "Beach Cleanup", "Mowing", "Painting", "Potholes",
  "Social Work", "Repairs", "Transport", "Medical", "Education",
  "Youth Sport", "Arts & Culture", "Environment", "Wildlife", "Parks",
  "Personal", "Other",
];
