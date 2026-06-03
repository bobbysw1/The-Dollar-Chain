"use client";
import { create } from "zustand";
import type { PersonAppearance, HairStyle, Accessory, Build, Plan, PaymentMethod, Tier } from "@/lib/types";
import { SKIN_TONES, SHIRT_COLOURS, HAIR_COLOURS, HAIR_STYLES, ACCESSORIES, BUILDS } from "@/lib/types";

interface JoinState extends PersonAppearance {
  plan: Plan;
  paymentMethod: PaymentMethod;
  tier: Tier;
  /** Optional override: a custom WEEKLY amount in cents (0 = use the chosen plan).
   *  We gently discourage this — the whole point is everyone gives the same $1. */
  customWeeklyCents: number;
  displayName: string;
  email: string;
  city: string;
  /** Slug of the suburb the member dedicates their $1 to (e.g. "palm-beach"). */
  dedicatedSuburb: string;
  notify: boolean;
  /** Referral code from ?ref= on arrival, if any. */
  referredByCode: string;
  step: number;
  assignedNumber: number;
  set: (patch: Partial<JoinState>) => void;
  randomise: () => void;
  next: () => void;
  prev: () => void;
}

const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

export const useJoinStore = create<JoinState>((set, get) => ({
  plan: "monthly",
  paymentMethod: "becs",
  tier: "boosted",
  customWeeklyCents: 0,
  displayName: "",
  email: "",
  city: "",
  dedicatedSuburb: "",
  notify: true,
  referredByCode: "",
  step: 1,
  assignedNumber: 1248,
  skinTone: SKIN_TONES[1],
  shirtColour: SHIRT_COLOURS[0],
  hairColour: HAIR_COLOURS[1],
  hairStyle: "short" as HairStyle,
  build: "regular" as Build,
  accessories: [] as Accessory[],
  photoUrl: "" as string,
  set: (patch) => set(patch),
  randomise: () => set({
    skinTone: pick(SKIN_TONES),
    shirtColour: pick(SHIRT_COLOURS),
    hairColour: pick(HAIR_COLOURS),
    hairStyle: pick(HAIR_STYLES),
    build: pick(BUILDS),
    accessories: Math.random() > 0.5 ? [pick(ACCESSORIES)] : [],
  }),
  next: () => set({ step: Math.min(4, get().step + 1) }),
  prev: () => set({ step: Math.max(1, get().step - 1) }),
}));
