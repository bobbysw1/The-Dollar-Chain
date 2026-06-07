"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronUp, Coins, MapPin } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { Dot, Badge } from "@/components/ui/Badge";
import { CountUp } from "@/components/CountUp";
import { CreditsBar } from "@/components/CreditsBar";
import { CauseArt } from "@/components/causes/CauseArt";
import { useMe } from "@/lib/useMe";
import { SUBURBS, getSuburb } from "@/lib/suburbs";
import { MOCK_PROJECTS, formatAUD, formatDate } from "@/lib/data";
import { CATEGORY_COLOURS, ALL_CATEGORIES, type ProjectCategory } from "@/lib/types";

const CATS: (ProjectCategory | "All")[] = ["All", ...ALL_CATEGORIES];

type SuburbTotals = Record<string, { members: number; raisedCents: number }>;

export default function ProjectsPage() {
  const [filter, setFilter] = useState<ProjectCategory | "All">("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [suburb, setSuburb] = useState<string>("all");
  const { me, refresh } = useMe();
  const [stats, setStats] = useState<{ raisedCents: number; peopleHelped: number; balanceCents: number; suburbs?: SuburbTotals }>({ raisedCents: 0, peopleHelped: 0, balanceCents: 0 });
  useEffect(() => {
    fetch("/api/stats", { cache: "no-store" }).then((r) => r.json()).then(setStats).catch(() => {});
  }, []);
  const items = MOCK_PROJECTS.filter((p) => filter === "All" || p.category === filter);
  const potCents = suburb === "all" ? stats.balanceCents : (stats.suburbs?.[suburb]?.raisedCents ?? 0);
  const potLabel = suburb === "all" ? "across all suburbs" : `in ${getSuburb(suburb)?.name ?? suburb}`;

  return (
    <main className="min-h-screen bg-cream">
      <SiteNav />
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12">
        <div>
          <h1 className="text-5xl font-semibold tracking-tight">Impact</h1>
          <p className="text-muted mt-3 text-lg">
            <CountUp to={stats.raisedCents / 100} prefix="$" /> raised —{" "}
            <CountUp to={stats.peopleHelped} /> {stats.peopleHelped === 1 ? "person" : "people"} directly helped
          </p>

          {/* per-suburb pot selector */}
          <div className="mt-5 flex items-center gap-2 text-sm">
            <span className="text-muted inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" /> See the pot for</span>
            <select
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-white text-ink focus:outline-none focus:border-accent"
            >
              <option value="all">All suburbs</option>
              {SUBURBS.map((sb) => <option key={sb.slug} value={sb.slug}>{sb.name}</option>)}
            </select>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-3 h-8 text-sm rounded-full border transition-colors ${
                  filter === c
                    ? "bg-accent text-white border-accent"
                    : "bg-white text-ink border-border hover:border-ink/30"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {items.length === 0 && (
            <div className="mt-8 rounded-card border border-dashed border-border bg-white/60 p-10 text-center">
              <h3 className="text-xl font-semibold">No projects funded yet.</h3>
              <p className="text-muted mt-2 max-w-md mx-auto">
                We're brand new and haven't deployed a dollar yet — we won't pretend otherwise. The moment
                the chain funds its first cause, it'll appear here with the amount and who made it happen.
              </p>
            </div>
          )}
          <div className="mt-8 divide-y divide-border">
            {items.map((p) => {
              const open = expanded === p.id;
              return (
                <article key={p.id} className="py-6 grid grid-cols-[100px_1fr] gap-6">
                  <div className="font-mono text-xs text-muted tabular pt-1">{formatDate(p.date)}</div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-muted mb-1.5">
                      <Dot color={CATEGORY_COLOURS[p.category]} />
                      <span>{p.category}</span>
                    </div>
                    <button onClick={() => setExpanded(open ? null : p.id)} className="text-left">
                      <h3 className="font-semibold text-lg leading-snug hover:text-accent transition-colors">{p.title}</h3>
                    </button>
                    <AnimatePresence initial={false}>
                      {open ? (
                        <motion.p
                          key="full"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="text-muted mt-2 overflow-hidden"
                        >
                          {p.description}
                        </motion.p>
                      ) : (
                        <p className="text-muted mt-2 line-clamp-2">{p.description}</p>
                      )}
                    </AnimatePresence>
                    <p className="mt-3 text-xs text-muted">
                      {formatAUD(p.amountCents)} used — funded by members #
                      {p.fundedByRange[0]}–#{p.fundedByRange[1]}
                    </p>
                    {p.quote && open && (
                      <blockquote className="mt-3 italic text-sm text-muted border-l-2 border-border pl-3">
                        "{p.quote}"
                      </blockquote>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="lg:sticky lg:top-6 self-start space-y-6">
          <div className="bg-white border border-border rounded-card p-6">
            <div className="text-sm text-muted">In the pot {potLabel}</div>
            <div className="text-3xl font-semibold mt-1 tabular">{formatAUD(potCents)}</div>
            <div className="text-xs text-muted mt-1">ready to deploy</div>
          </div>
          {/* Voting is members-only */}
          {me?.authenticated && <CreditsBar me={me} onChange={refresh} />}
          {me?.authenticated && <VoteCard me={me} onChange={refresh} />}
          <MemberCausesCard />
        </aside>
      </div>
      <SiteFooter />
    </main>
  );
}

interface Counts { Shelter: number; Food: number; Rent: number }

function VoteCard({ me, onChange }: { me: ReturnType<typeof useMe>["me"]; onChange: () => void }) {
  const [counts, setCounts] = useState<Counts>({ Shelter: 0, Food: 0, Rent: 0 });
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/vote", { cache: "no-store" });
    const j = await r.json();
    setCounts(j.counts);
  }, []);
  useEffect(() => { load(); }, [load]);

  const total = counts.Shelter + counts.Food + counts.Rent;
  const opts: ("Shelter" | "Food" | "Rent")[] = ["Shelter", "Food", "Rent"];
  const voted = me?.votedThisWeek ?? null;
  const canVote = me?.authenticated && (me.credits ?? 0) > 0 && !voted;

  const cast = async (o: "Shelter" | "Food" | "Rent") => {
    setError(null);
    const r = await fetch("/api/vote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: "category", category: o }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.error || "Vote failed");
      return;
    }
    await load();
    onChange();
  };

  return (
    <div className="bg-white border border-border rounded-card p-6">
      <div className="font-medium mb-1">Where should this week's fund go?</div>
      <div className="text-xs text-muted mb-4 flex items-center gap-1.5">
        <Coins className="w-3 h-3" />
        Costs 1 credit · closes Sunday midnight
      </div>
      <div className="space-y-2">
        {opts.map((o) => {
          const pct = total ? Math.round((counts[o] / total) * 100) : 0;
          const isVote = voted === o;
          const disabled = !canVote || !!voted;
          return (
            <button
              key={o}
              disabled={disabled}
              onClick={() => cast(o)}
              className={`relative w-full text-left p-3 rounded-xl border overflow-hidden transition-colors ${
                isVote ? "border-accent" : "border-border hover:border-ink/30"
              } ${disabled ? "cursor-not-allowed" : ""}`}
            >
              {voted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 bg-emerald-50"
                />
              )}
              <div className="relative flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Dot color={CATEGORY_COLOURS[o]} />
                  <span className="font-medium">{o}</span>
                </span>
                {voted ? (
                  <span className="text-sm tabular text-muted">{pct}%</span>
                ) : (
                  <span className="text-xs text-muted tabular">{counts[o]}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {voted && <div className="mt-3 text-xs text-muted">Thanks — your vote is in for {voted}.</div>}
      {!me?.authenticated && <div className="mt-3 text-xs text-muted">Sign in to vote.</div>}
      {me?.authenticated && (me.credits ?? 0) === 0 && !voted && (
        <div className="mt-3 text-xs text-muted">You'll get a credit on your next $1 payment.</div>
      )}
      {error && <div className="mt-3 text-xs text-danger">{labelError(error)}</div>}
    </div>
  );
}

function labelError(code: string) {
  switch (code) {
    case "no_credits": return "You don't have any vote credits this week.";
    case "already_voted": return "You've already voted this week.";
    case "not_authenticated": return "Sign in to vote.";
    default: return code;
  }
}

function MemberCausesCard() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/causes", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setItems((j.causes ?? []).filter((c: any) => c.source === "member")))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white border border-border rounded-card p-6">
      <div className="flex items-center justify-between mb-1">
        <div className="font-medium">Member causes</div>
        <Link href="/causes/new" className="text-xs text-accent hover:underline inline-flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add a cause
        </Link>
      </div>
      <div className="text-xs text-muted mb-4 flex items-center gap-1.5">
        <Coins className="w-3 h-3" />
        Real local fixes raised by members. Open one to back it — your $1 is a vote.
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted">No causes yet — <Link href="/causes/new" className="text-accent hover:underline">add the first</Link>.</p>
      ) : (
        <ul className="space-y-2.5">
          {items.slice(0, 8).map((c) => (
            <li key={c.id}>
              <Link href={`/causes/${c.id}`} className="block group rounded-xl border border-border hover:border-ink/20 overflow-hidden transition-colors">
                <div className="h-20 overflow-hidden border-b border-border">
                  {c.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <CauseArt category={c.category as ProjectCategory} className="w-full h-full" />
                  )}
                </div>
                <div className="p-2.5">
                  <div className="text-sm font-medium leading-snug group-hover:text-accent transition-colors">{c.title}</div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted">
                    <Dot color={CATEGORY_COLOURS[c.category as ProjectCategory]} /> <span>{c.category}</span>
                    {c.suburb && <span>· {getSuburb(c.suburb)?.name ?? c.suburb}</span>}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
