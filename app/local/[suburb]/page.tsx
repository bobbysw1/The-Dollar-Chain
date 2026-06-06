import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin, ArrowLeft, Users } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { Badge, Dot } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getSuburb, SUBURB_SLUGS, SUBURBS } from "@/lib/suburbs";
import { getSuburbTotals } from "@/lib/members";
import { listActiveCauses } from "@/lib/causes";
import { SuburbScene } from "@/components/suburb/SuburbScene";
import { CauseArt } from "@/components/causes/CauseArt";
import { MOCK_PROJECTS, formatAUD, formatDate } from "@/lib/data";
import { CATEGORY_COLOURS } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Params { params: { suburb: string } }

export function generateStaticParams() {
  return SUBURB_SLUGS.map((suburb) => ({ suburb }));
}

export function generateMetadata({ params }: Params): Metadata {
  const s = getSuburb(params.suburb);
  if (!s) return { title: "Suburb not found" };
  return {
    title: `${s.name} — The Dollar Chain`,
    description: `${s.name} chapter of The Dollar Chain. ${s.intro}`,
  };
}

export default async function SuburbPage({ params }: Params) {
  const suburb = getSuburb(params.suburb);
  if (!suburb) notFound();

  const totals = await getSuburbTotals();
  const live = totals[suburb.slug] ?? { members: 0, raisedCents: 0, donatedCents: 0 };

  const allCauses = await listActiveCauses();
  const localCauses = allCauses.filter((c) => c.suburb === suburb.slug && c.id !== "c-where-needed");

  // Surface projects in this suburb's priority categories.
  const localProjects = MOCK_PROJECTS.filter((p) => suburb.priorityCategories.includes(p.category)).slice(0, 6);
  const nearbySuburbs = SUBURBS.filter((x) => x.slug !== suburb.slug).slice(0, 6);

  return (
    <main className="min-h-screen bg-cream">
      <SiteNav />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Link href="/local" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> All suburbs
        </Link>

        {/* COLOURFUL SCENE BANNER */}
        <div className="relative rounded-card overflow-hidden border border-border mb-10 h-44 sm:h-56">
          <SuburbScene slug={suburb.slug} className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white drop-shadow">{suburb.name}</h1>
            <span className="text-white/90 text-sm font-mono tabular drop-shadow">{suburb.postcode}</span>
          </div>
        </div>

        {/* HERO */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge tone="accent" className="mb-4">
              <MapPin className="w-3 h-3" /> {suburb.postcode} · Southern Gold Coast
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight">{suburb.name}</h1>
            <p className="mt-5 text-lg text-muted">{suburb.intro}</p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/join"><Button size="lg">Dedicate your $1 to {suburb.name}</Button></Link>
              <Link href="/projects" className="text-sm text-accent hover:underline">See all impact →</Link>
            </div>
            <p className="mt-3 text-xs text-muted">Local people, local projects — but anyone can chip in to {suburb.name}'s pot.</p>
          </div>
          <div className="rounded-card border border-border bg-white p-6">
            <div className="text-sm font-medium text-muted mb-4">{suburb.name} is focused on</div>
            <div className="flex flex-wrap gap-2">
              {suburb.priorityCategories.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 text-sm border border-border rounded-full px-3 py-1.5">
                  <Dot color={CATEGORY_COLOURS[c]} />{c}
                </span>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xl font-semibold tabular">{live.members}</div>
                <div className="text-[11px] text-muted">members</div>
              </div>
              <div>
                <div className="text-xl font-semibold tabular">{suburb.projectsFunded}</div>
                <div className="text-[11px] text-muted">projects</div>
              </div>
              <div>
                <div className="text-xl font-semibold tabular">{formatAUD(live.raisedCents)}</div>
                <div className="text-[11px] text-muted">raised</div>
              </div>
            </div>
          </div>
        </section>

        {/* LOCAL STATS */}
        <section className="mt-16 grid grid-cols-3 gap-3">
          <Stat label="Members in this suburb" value={live.members.toLocaleString()} />
          <Stat label="Projects funded here" value={String(suburb.projectsFunded)} />
          <Stat label="Raised here (after fees)" value={formatAUD(live.raisedCents)} />
        </section>

        {/* IMPROVEMENT FUND — causes locals have flagged */}
        <section className="mt-16">
          <h2 className="text-3xl font-semibold tracking-tight">The {suburb.name} improvement fund</h2>
          <p className="text-muted mt-2 max-w-2xl">
            Real things locals have flagged that need fixing — the council should, but isn&apos;t. Back the ones you
            care about with your $1. Every dollar is a vote for what gets done first.
          </p>
          {localCauses.length > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 text-xs text-accent bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5">
              <Users className="w-3.5 h-3.5" />
              Submitted by the community — sourced from local residents
            </div>
          )}

          {localCauses.length === 0 ? (
            <div className="mt-6 rounded-card border border-dashed border-border bg-white/60 p-8 text-center">
              <p className="text-muted">No causes here yet. <Link href="/causes/new" className="text-accent hover:underline">Add the first one</Link> — what needs fixing near you?</p>
            </div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {localCauses.map((c) => {
                  const target = c.targetCents ?? 0;
                  const raised = c.raisedCents ?? 0;
                  const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
                  return (
                    <Link key={c.id} href={`/causes/${c.id}`}
                      className="group bg-white border border-border rounded-card overflow-hidden hover:border-ink/30 hover:-translate-y-0.5 transition-all">
                      <div className="h-32 overflow-hidden border-b border-border">
                        {c.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <CauseArt category={c.category} className="w-full h-full" />
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 text-xs text-muted mb-1.5">
                          <Dot color={CATEGORY_COLOURS[c.category]} /> <span>{c.category}</span>
                        </div>
                        <h3 className="font-semibold leading-snug group-hover:text-accent transition-colors">{c.title}</h3>
                        <p className="text-sm text-muted mt-1 line-clamp-2">{c.description}</p>
                        {target > 0 && (
                          <div className="mt-3">
                            <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                              <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="text-[11px] text-muted mt-1 tabular">{formatAUD(raised)} of {formatAUD(target)}</div>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-5">
                <Link href="/causes/new" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
                  + Add another {suburb.name} cause
                </Link>
              </div>
            </>
          )}
        </section>

        {/* FOCUS */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold mb-4">What we're focused on in {suburb.name}</h2>
          <ul className="space-y-3">
            {suburb.focus.map((f) => (
              <li key={f} className="flex items-start gap-3 p-4 bg-white border border-border rounded-card">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {suburb.priorityCategories.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-sm border border-border rounded-full px-3 py-1 bg-white">
                <Dot color={CATEGORY_COLOURS[c]} />{c}
              </span>
            ))}
          </div>
        </section>

        {/* RELEVANT PROJECTS */}
        {localProjects.length > 0 && (
          <section className="mt-16">
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-2xl font-semibold">Recent work in these categories</h2>
              <Link href="/projects" className="text-sm text-accent hover:underline">All projects →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {localProjects.map((p) => (
                <article key={p.id} className="bg-white border border-border rounded-card overflow-hidden hover:border-ink/20 transition-colors">
                  <div className="h-1.5 w-full" style={{ background: CATEGORY_COLOURS[p.category] }} aria-hidden />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2 text-xs text-muted">
                      <Dot color={CATEGORY_COLOURS[p.category]} /> <span>{p.category}</span>
                      <span>•</span><span className="font-mono tabular">{formatDate(p.date)}</span>
                    </div>
                    <h3 className="font-semibold text-base leading-snug">{p.title}</h3>
                    <p className="mt-2 text-sm text-muted line-clamp-2">{p.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* NEARBY */}
        <section className="mt-20">
          <h2 className="text-2xl font-semibold mb-4">Nearby suburbs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {nearbySuburbs.map((s) => (
              <Link
                key={s.slug}
                href={`/local/${s.slug}`}
                className="bg-white border border-border rounded-xl px-3 py-3 hover:border-ink/30 transition-colors"
              >
                <div className="font-medium text-sm">{s.name}</div>
                <div className="text-xs text-muted font-mono tabular mt-0.5">{s.postcode}</div>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-20 p-8 rounded-card border border-border bg-surface text-center">
          <h3 className="text-2xl font-semibold mb-2">Add {suburb.name} to the chain.</h3>
          <p className="text-muted mb-4">One dollar. Your number. Real local change.</p>
          <Link href="/join"><Button size="lg">Join the Chain</Button></Link>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-border rounded-card p-5">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular">{value}</div>
    </div>
  );
}
