import { FundedProject } from "./types";

/* ----------------------------------------------------------------------------
 * Real data lives in the backend store (members, votes, submissions). This file
 * holds only: formatting helpers, the chain-ordering rule, and the shapes for
 * projects/financial reports — which start EMPTY because nothing has been funded
 * yet. Populate these from the admin dashboard / store as real work happens.
 * -------------------------------------------------------------------------- */

export const formatAUD = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-AU", {
    minimumFractionDigits: cents % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });

export const formatMonth = (m: string) => {
  const [y, mo] = m.split("-");
  return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("en-AU", { month: "long", year: "numeric" });
};

/**
 * The order of the chain. Active members hold their place by number (oldest →
 * newest). The moment someone stops donating they drop to the very tail — they
 * literally become "the latest link". Returning restores their place.
 */
export function chainOrdered<T extends { number: number; isActive: boolean }>(members: T[]): T[] {
  const byNumber = (a: T, b: T) => a.number - b.number;
  const active = members.filter((m) => m.isActive).sort(byNumber);
  const lapsed = members.filter((m) => !m.isActive).sort(byNumber);
  return [...active, ...lapsed];
}

/* ---------- Projects (funded work) — empty until we fund something ---------- */

export const MOCK_PROJECTS: FundedProject[] = [];

/* ---------- Financial / transparency ---------- */

export interface MonthlyReport {
  month: string;
  raisedCents: number;
  deployedCents: number;
  projectsCount: number;
  closingBalanceCents: number;
  costs: { stripeFeesCents: number; hostingCents: number; coordinatorCents: number; domainCents: number };
  rolledOverCents: number;
  notes?: string;
}

export const MONTHLY_REPORTS: MonthlyReport[] = [];

export const TRUST_ACCOUNT_NAME = "The Dollar Chain Community Fund";
