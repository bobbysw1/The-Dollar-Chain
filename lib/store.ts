/**
 * Key→JSON store. Two interchangeable backends:
 *
 *  • Supabase (a single `kv` table)  — used automatically when SUPABASE_URL and
 *    SUPABASE_SERVICE_KEY are set. This is the production path.
 *  • Local JSON files (./data/*.json) — the fallback for local development.
 *
 * All the app's business logic (members, votes, credits, submissions) reads and
 * writes through readJSON/writeJSON, so switching backends needs no other code
 * changes — just the two environment variables.
 */
import { promises as fs } from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const KV_TABLE = process.env.SUPABASE_KV_TABLE || "kv";

export const STORE_BACKEND: "supabase" | "file" =
  SUPABASE_URL && SUPABASE_SERVICE_KEY ? "supabase" : "file";

let _sb: SupabaseClient | null = null;
function sb(): SupabaseClient {
  if (!_sb) {
    _sb = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
      auth: { persistSession: false },
      global: {
        // Next.js caches fetch() by default, which would serve stale database
        // reads. Force every Supabase request to bypass that cache.
        fetch: (input, init) => fetch(input as RequestInfo, { ...init, cache: "no-store" }),
      },
    });
  }
  return _sb;
}

/* ----------------------------- file backend ----------------------------- */

const DATA_DIR = path.join(process.cwd(), "data");

async function fileRead<T>(key: string, fallback: T): Promise<T> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(path.join(DATA_DIR, key), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function fileWrite<T>(key: string, data: T): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, key), JSON.stringify(data, null, 2));
}

/* --------------------------- supabase backend --------------------------- */

async function sbRead<T>(key: string, fallback: T): Promise<T> {
  const { data, error } = await sb().from(KV_TABLE).select("value").eq("key", key).limit(1);
  if (error) throw new Error(`Supabase read failed for "${key}": ${error.message}`);
  const row = data && data[0];
  return (row?.value as T) ?? fallback;
}

async function sbWrite<T>(key: string, data: T): Promise<void> {
  const { error } = await sb().from(KV_TABLE).upsert({ key, value: data }, { onConflict: "key" });
  if (error) throw new Error(`Supabase write failed for "${key}": ${error.message}`);
}

/* ------------------------------- public API ------------------------------ */

export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  return STORE_BACKEND === "supabase" ? sbRead(key, fallback) : fileRead(key, fallback);
}

export async function writeJSON<T>(key: string, data: T): Promise<void> {
  return STORE_BACKEND === "supabase" ? sbWrite(key, data) : fileWrite(key, data);
}

/** In-process mutex so concurrent writes in one instance don't clobber each other. */
const locks = new Map<string, Promise<unknown>>();
export async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) || Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(key, next.catch(() => {}));
  try { return await next; } finally {
    if (locks.get(key) === next) locks.delete(key);
  }
}
