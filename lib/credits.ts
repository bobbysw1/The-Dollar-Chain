import { readJSON, writeJSON, withLock } from "./store";

const FILE = "credits.json";

interface CreditsFile {
  /** ISO date the current voting week ends — credits reset on next week */
  weekEndsAt: string;
  /** memberNumber -> remaining vote credits this week */
  balances: Record<string, number>;
  /** processed Stripe event IDs to ensure idempotency */
  processedEvents: string[];
}

function emptyFile(): CreditsFile {
  return { weekEndsAt: nextWeekEnd(), balances: {}, processedEvents: [] };
}

/** Sunday 23:59:59 of the current week (UK) — voting cycle */
function nextWeekEnd(): string {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday
  const daysUntilSunday = (7 - day) % 7 || 7;
  const end = new Date(now);
  end.setUTCDate(now.getUTCDate() + daysUntilSunday);
  end.setUTCHours(23, 59, 59, 0);
  return end.toISOString();
}

async function load(): Promise<CreditsFile> {
  const file = await readJSON<CreditsFile>(FILE, emptyFile());
  // Reset balances if voting week has rolled over
  if (new Date(file.weekEndsAt).getTime() < Date.now()) {
    return { weekEndsAt: nextWeekEnd(), balances: {}, processedEvents: file.processedEvents.slice(-500) };
  }
  return file;
}

export async function getCredits(memberNumber: number): Promise<number> {
  const file = await load();
  return file.balances[String(memberNumber)] ?? 0;
}

export async function grantCredit(memberNumber: number, eventId: string): Promise<{ granted: boolean; balance: number }> {
  return withLock(FILE, async () => {
    const file = await load();
    if (file.processedEvents.includes(eventId)) {
      return { granted: false, balance: file.balances[String(memberNumber)] ?? 0 };
    }
    const key = String(memberNumber);
    file.balances[key] = (file.balances[key] ?? 0) + 1;
    file.processedEvents.push(eventId);
    await writeJSON(FILE, file);
    return { granted: true, balance: file.balances[key] };
  });
}

export async function burnCredit(memberNumber: number): Promise<boolean> {
  return withLock(FILE, async () => {
    const file = await load();
    const key = String(memberNumber);
    const balance = file.balances[key] ?? 0;
    if (balance < 1) return false;
    file.balances[key] = balance - 1;
    await writeJSON(FILE, file);
    return true;
  });
}

export async function getWeekEndsAt(): Promise<string> {
  const file = await load();
  return file.weekEndsAt;
}
