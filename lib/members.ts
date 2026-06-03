import { readJSON, writeJSON, withLock } from "./store";
import type { Plan, PersonAppearance, Allocation } from "./types";
import { SKIN_TONES, SHIRT_COLOURS, HAIR_COLOURS } from "./types";
import { AUTO_ALLOCATE_CAUSE_ID } from "./causes";

const FILE = "members.json";

export interface MemberRecord {
  number: number;
  email: string;
  /** scrypt password hash. Absent until the member sets a password after donating. */
  passwordHash?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plan: Plan;
  joinedAt: string;

  // Profile
  displayName?: string;
  city?: string;
  dedicatedSuburb?: string;
  notify: boolean;
  avatar: PersonAppearance;

  // Allocation of their $1
  autoAllocate: boolean;
  allocations: Allocation[];

  // Referrals
  referralCode: string;
  referredBy?: string;
  referralCount: number;

  // Impact (updated by webhooks / payouts)
  contributedCents: number;
  projectsHelped: string[];
  active: boolean;
}

/** Minimal shape shown publicly on the chain (no email/payment data). */
export interface PublicMember {
  number: number;
  displayName?: string;
  dedicatedSuburb?: string;
  isActive: boolean;
  skinTone: string;
  shirtColour: string;
  hairColour: string;
  hairStyle: PersonAppearance["hairStyle"];
  build: PersonAppearance["build"];
  accessories: PersonAppearance["accessories"];
  photoUrl?: string;
  photoPlacement?: PersonAppearance["photoPlacement"];
  photoShape?: PersonAppearance["photoShape"];
  contributedCents: number;
  joinedAt: string;
  projectsHelped: string[];
  plan: Plan;
  city?: string;
}

interface MembersFile {
  nextNumber: number;
  byNumber: Record<string, MemberRecord>;
  byCustomerId: Record<string, number>;
  byEmail: Record<string, number>;
  byReferralCode: Record<string, number>;
}

function empty(): MembersFile {
  // #1 is the founder (seeded by ensureFounder); the next real member is #2.
  return { nextNumber: 2, byNumber: {}, byCustomerId: {}, byEmail: {}, byReferralCode: {} };
}

async function load(): Promise<MembersFile> {
  const file = await readJSON<MembersFile>(FILE, empty());
  file.byReferralCode ||= {};
  return file;
}

function defaultAvatar(): PersonAppearance {
  return {
    skinTone: SKIN_TONES[1],
    shirtColour: SHIRT_COLOURS[0],
    hairColour: HAIR_COLOURS[1],
    hairStyle: "short",
    build: "regular",
    accessories: [],
  };
}

/** Migrate older saved avatars (single `accessory`, no build) to the new shape. */
function normaliseAvatar(a: Partial<PersonAppearance> & { accessory?: string }): PersonAppearance {
  const base = defaultAvatar();
  const accessories = Array.isArray(a.accessories)
    ? a.accessories
    : (a.accessory && a.accessory !== "none" ? [a.accessory as PersonAppearance["accessories"][number]] : []);
  return {
    skinTone: a.skinTone ?? base.skinTone,
    shirtColour: a.shirtColour ?? base.shirtColour,
    hairColour: a.hairColour ?? base.hairColour,
    hairStyle: a.hairStyle ?? base.hairStyle,
    build: a.build ?? base.build,
    accessories,
    photoUrl: a.photoUrl,
    photoStatus: a.photoStatus,
    photoPlacement: a.photoPlacement ?? (a.photoUrl ? "full" : undefined),
    photoShape: a.photoShape,
  };
}

function makeReferralCode(existing: Record<string, number>): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  do {
    code = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  } while (existing[code]);
  return code;
}

function toPublic(m: MemberRecord): PublicMember {
  const av = normaliseAvatar(m.avatar);
  return {
    number: m.number,
    displayName: m.displayName,
    dedicatedSuburb: m.dedicatedSuburb,
    isActive: m.active,
    skinTone: av.skinTone,
    shirtColour: av.shirtColour,
    hairColour: av.hairColour,
    hairStyle: av.hairStyle,
    build: av.build,
    accessories: av.accessories,
    // Only expose an uploaded photo publicly once it's been approved.
    photoUrl: av.photoStatus === "approved" ? av.photoUrl : undefined,
    photoPlacement: av.photoStatus === "approved" ? av.photoPlacement : undefined,
    photoShape: av.photoStatus === "approved" ? av.photoShape : undefined,
    contributedCents: m.contributedCents,
    joinedAt: m.joinedAt,
    projectsHelped: m.projectsHelped,
    plan: m.plan,
    city: m.city,
  };
}

/** Seed the founder, #1, so the chain always has at least one link. */
export async function ensureFounder(): Promise<void> {
  await withLock(FILE, async () => {
    const file = await load();
    if (file.byNumber["1"]) return;
    const referralCode = makeReferralCode(file.byReferralCode);
    const founder: MemberRecord = {
      number: 1,
      email: "founder@dollarchain.org",
      plan: "weekly",
      joinedAt: new Date().toISOString(),
      displayName: "The first link",
      dedicatedSuburb: "palm-beach",
      notify: true,
      avatar: { skinTone: SKIN_TONES[2], shirtColour: SHIRT_COLOURS[2], hairColour: HAIR_COLOURS[0], hairStyle: "short", build: "regular", accessories: [] },
      autoAllocate: true,
      allocations: [{ causeId: AUTO_ALLOCATE_CAUSE_ID, pct: 100 }],
      referralCode,
      referralCount: 0,
      contributedCents: 0,
      projectsHelped: [],
      active: true,
    };
    file.byNumber["1"] = founder;
    file.byEmail[founder.email] = 1;
    file.byReferralCode[referralCode] = 1;
    if (file.nextNumber < 2) file.nextNumber = 2;
    await writeJSON(FILE, file);
  });
}

export async function getMemberByNumber(n: number): Promise<MemberRecord | null> {
  await ensureFounder();
  const file = await load();
  return file.byNumber[String(n)] ?? null;
}

export async function getMemberByCustomerId(customerId: string): Promise<MemberRecord | null> {
  const file = await load();
  const n = file.byCustomerId[customerId];
  return n ? file.byNumber[String(n)] ?? null : null;
}

export async function getMemberByEmail(email: string): Promise<MemberRecord | null> {
  const file = await load();
  const n = file.byEmail[email.toLowerCase()];
  return n ? file.byNumber[String(n)] ?? null : null;
}

export async function getMemberByReferralCode(code: string): Promise<MemberRecord | null> {
  const file = await load();
  const n = file.byReferralCode[code.toUpperCase()];
  return n ? file.byNumber[String(n)] ?? null : null;
}

/** All members for the public chain, oldest first. */
export async function listPublicMembers(): Promise<PublicMember[]> {
  await ensureFounder();
  const file = await load();
  return Object.values(file.byNumber).sort((a, b) => a.number - b.number).map(toPublic);
}

export async function getPublicStats() {
  await ensureFounder();
  const file = await load();
  const all = Object.values(file.byNumber);
  const active = all.filter((m) => m.active);
  return {
    total: all.length,
    active: active.length,
    nextNumber: file.nextNumber,
    contributedCents: all.reduce((s, m) => s + m.contributedCents, 0),
    suburbsBacked: new Set(all.map((m) => m.dedicatedSuburb).filter(Boolean)).size,
  };
}

interface NewMemberArgs {
  email: string;
  plan: Plan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  displayName?: string;
  city?: string;
  dedicatedSuburb?: string;
  avatar?: PersonAppearance;
  referredByCode?: string;
}

/** Create or update a member (Stripe checkout path, or a pledge without Stripe). */
export async function upsertMemberFromCheckout(args: NewMemberArgs): Promise<MemberRecord> {
  await ensureFounder();
  return withLock(FILE, async () => {
    const file = await load();
    const existingByEmail = file.byEmail[args.email.toLowerCase()];
    const existingByCustomer = args.stripeCustomerId ? file.byCustomerId[args.stripeCustomerId] : undefined;
    const number = existingByCustomer ?? existingByEmail ?? file.nextNumber;
    const isNew = existingByCustomer === undefined && existingByEmail === undefined;
    if (isNew) file.nextNumber += 1;

    const prev = file.byNumber[String(number)];
    const referralCode = prev?.referralCode ?? makeReferralCode(file.byReferralCode);

    let referredBy = prev?.referredBy;
    if (isNew && args.referredByCode) {
      const refN = file.byReferralCode[args.referredByCode.toUpperCase()];
      if (refN && refN !== number) {
        referredBy = args.referredByCode.toUpperCase();
        const referrer = file.byNumber[String(refN)];
        if (referrer) referrer.referralCount = (referrer.referralCount ?? 0) + 1;
      }
    }

    const record: MemberRecord = {
      number,
      email: args.email,
      passwordHash: prev?.passwordHash,
      stripeCustomerId: args.stripeCustomerId ?? prev?.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId ?? prev?.stripeSubscriptionId,
      plan: args.plan,
      joinedAt: prev?.joinedAt ?? new Date().toISOString(),
      displayName: args.displayName ?? prev?.displayName,
      city: args.city ?? prev?.city,
      dedicatedSuburb: args.dedicatedSuburb ?? prev?.dedicatedSuburb ?? "palm-beach",
      notify: prev?.notify ?? true,
      avatar: args.avatar ?? prev?.avatar ?? defaultAvatar(),
      autoAllocate: prev?.autoAllocate ?? true,
      allocations: prev?.allocations ?? [{ causeId: AUTO_ALLOCATE_CAUSE_ID, pct: 100 }],
      referralCode,
      referredBy,
      referralCount: prev?.referralCount ?? 0,
      contributedCents: prev?.contributedCents ?? 0,
      projectsHelped: prev?.projectsHelped ?? [],
      active: true,
    };
    file.byNumber[String(number)] = record;
    if (record.stripeCustomerId) file.byCustomerId[record.stripeCustomerId] = number;
    file.byEmail[args.email.toLowerCase()] = number;
    file.byReferralCode[referralCode] = number;
    await writeJSON(FILE, file);
    return record;
  });
}

/** Set (or change) a member's password. */
export async function setMemberPassword(number: number, passwordHash: string): Promise<MemberRecord | null> {
  return withLock(FILE, async () => {
    const file = await load();
    const rec = file.byNumber[String(number)];
    if (!rec) return null;
    rec.passwordHash = passwordHash;
    await writeJSON(FILE, file);
    return rec;
  });
}

/** Patch editable account fields. */
export async function updateMember(
  number: number,
  patch: Partial<Pick<MemberRecord,
    "displayName" | "city" | "dedicatedSuburb" | "notify" |
    "avatar" | "autoAllocate" | "allocations" | "plan" | "active" |
    "contributedCents" | "projectsHelped">>
): Promise<MemberRecord | null> {
  return withLock(FILE, async () => {
    const file = await load();
    const rec = file.byNumber[String(number)];
    if (!rec) return null;
    Object.assign(rec, patch);
    await writeJSON(FILE, file);
    return rec;
  });
}

/** Mark a member active/sleeping by Stripe customer (webhook). */
export async function setMemberActive(customerId: string, active: boolean): Promise<void> {
  await withLock(FILE, async () => {
    const file = await load();
    const n = file.byCustomerId[customerId];
    if (n && file.byNumber[String(n)]) {
      file.byNumber[String(n)].active = active;
      await writeJSON(FILE, file);
    }
  });
}

/** Dev/testing only: ensure a member exists for a given number (for the dev sign-in shortcut). */
export async function ensureDevMember(number: number): Promise<MemberRecord> {
  await ensureFounder();
  return withLock(FILE, async () => {
    const file = await load();
    const existing = file.byNumber[String(number)];
    if (existing) return existing;
    const referralCode = makeReferralCode(file.byReferralCode);
    const record: MemberRecord = {
      number,
      email: `member${number}@example.com`,
      plan: "weekly",
      joinedAt: new Date().toISOString(),
      dedicatedSuburb: "palm-beach",
      notify: true,
      avatar: defaultAvatar(),
      autoAllocate: true,
      allocations: [{ causeId: AUTO_ALLOCATE_CAUSE_ID, pct: 100 }],
      referralCode,
      referralCount: 0,
      contributedCents: 0,
      projectsHelped: [],
      active: true,
    };
    file.byNumber[String(number)] = record;
    file.byEmail[record.email] = number;
    file.byReferralCode[referralCode] = number;
    if (number >= file.nextNumber) file.nextNumber = number + 1;
    await writeJSON(FILE, file);
    return record;
  });
}

/** Dev/testing: simulate a donation creating a pending member (no Stripe). */
export async function createDevPledge(args: {
  email: string; plan?: Plan; displayName?: string; dedicatedSuburb?: string; avatar?: PersonAppearance;
}): Promise<MemberRecord> {
  return upsertMemberFromCheckout({
    email: args.email,
    plan: args.plan ?? "weekly",
    displayName: args.displayName,
    dedicatedSuburb: args.dedicatedSuburb,
    avatar: args.avatar,
  });
}
