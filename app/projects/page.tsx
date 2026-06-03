"use client";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronUp, Coins } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { Dot, Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CountUp } from "@/components/CountUp";
import { CreditsBar } from "@/components/CreditsBar";
import { useMe } from "@/lib/useMe";
import { MOCK_PROJECTS, formatAUD, formatDate } from "@/lib/data";
import { CATEGORY_COLOURS, ALL_CATEGORIES, type ProjectCategory } from "@/lib/types";

const CATS: (ProjectCategory | "All")[] = ["All", ...ALL_CATEGORIES];

export default function ProjectsPage() {
  const [filter, setFilter] = useState<ProjectCategory | "All">("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const { me, refresh } = useMe();
  const [stats, setStats] = useState({ raisedCents: 0, peopleHelped: 0, balanceCents: 0 });
  useEffect(() => {
    fetch("/api/stats", { cache: "no-store" }).then((r) => r.json()).then(setStats).catch(() => {});
  }, []);
  const items = MOCK_PROJECTS.filter((p) => filter === "All" || p.category === filter);

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
            <div className="text-sm text-muted">This week's pot</div>
            <div className="text-3xl font-semibold mt-1 tabular">{formatAUD(stats.balanceCents)}</div>
            <div className="text-xs text-muted mt-1">ready to deploy</div>
          </div>
          <CreditsBar me={me} onChange={refresh} />
          <VoteCard me={me} onChange={refresh} />
          <SuggestionsCard me={me} onChange={refresh} />
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

function SuggestionsCard({ me, onChange }: { me: ReturnType<typeof useMe>["me"]; onChange: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProjectCategory>("Shelter");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/suggestions", { cache: "no-store" });
    const j = await r.json();
    setItems(j.items ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return;
    const r = await fetch("/api/suggestions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, description, category }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.error || "Submit failed");
      return;
    }
    setTitle(""); setDescription(""); setOpen(false);
    await load();
  };

  const upvote = async (id: string) => {
    setError(null);
    const r = await fetch("/api/vote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: "suggestion", id }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.error || "Upvote failed");
      return;
    }
    await load();
    onChange();
  };

  const memberNumber = me?.memberNumber;
  const credits = me?.credits ?? 0;

  return (
    <div className="bg-white border border-border rounded-card p-6">
      <div className="flex items-center justify-between mb-1">
        <div className="font-medium">Member suggestions</div>
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={!me?.authenticated}
          className="text-xs text-accent hover:underline inline-flex items-center gap-1 disabled:text-muted disabled:no-underline"
        >
          <Plus className="w-3 h-3" /> Suggest
        </button>
      </div>
      <div className="text-xs text-muted mb-4 flex items-center gap-1.5">
        <Coins className="w-3 h-3" />
        Suggest anything — kid's sport, kits, surgery, beach work, marching band. Members vote.
      </div>

      <AnimatePresence initial={false}>
        {open && me?.authenticated && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={submit}
            className="overflow-hidden mb-4"
          >
            <div className="space-y-2 pt-1">
              <input
                value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Issue title" maxLength={80}
                className="w-full h-9 px-3 text-sm rounded-lg border border-border focus:outline-none focus:border-accent"
              />
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief context (who, where, what's needed)"
                rows={3} maxLength={240}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:border-accent resize-none"
              />
              <select
                value={category} onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-white"
              >
                <option>Shelter</option><option>Rent</option><option>Food</option>
                <option>Utilities</option><option>Other</option>
              </select>
              <Button type="submit" size="sm" className="w-full" disabled={!title.trim()}>
                Submit as #{memberNumber}
              </Button>
              <p className="text-[11px] text-muted">Submitting is free. Upvotes cost 1 credit.</p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {items.length === 0 ? (
        <p className="text-sm text-muted">No suggestions yet — be the first.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((s) => {
            const hasVoted = memberNumber ? s.voters?.includes(memberNumber) : false;
            const canUpvote = me?.authenticated && credits > 0 && !hasVoted;
            return (
              <li key={s.id} className="flex items-start gap-2 p-3 rounded-xl border border-border hover:border-ink/20 transition-colors">
                <button
                  onClick={() => upvote(s.id)}
                  disabled={!canUpvote}
                  aria-label={`Upvote ${s.title}`}
                  className={`shrink-0 w-10 flex flex-col items-center justify-center py-1 rounded-lg border transition-colors ${
                    hasVoted
                      ? "bg-emerald-50 border-emerald-100 text-accent cursor-default"
                      : canUpvote
                        ? "border-border hover:border-accent hover:text-accent"
                        : "border-border text-muted cursor-not-allowed"
                  }`}
                >
                  <ChevronUp className="w-4 h-4" />
                  <span className="text-xs font-medium tabular">{s.votes}</span>
                </button>
                <div className="min-w-0">
                  <div className="text-sm font-medium leading-snug">{s.title}</div>
                  {s.description && (
                    <div className="text-xs text-muted mt-0.5 line-clamp-2">{s.description}</div>
                  )}
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted">
                    <Badge tone="muted" className="!text-[10px] !py-0">{s.category}</Badge>
                    <span>by #{s.suggestedBy}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {error && <div className="mt-3 text-xs text-danger">{labelError(error)}</div>}
    </div>
  );
}
