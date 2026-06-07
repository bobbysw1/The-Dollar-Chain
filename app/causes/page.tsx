import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, Plus } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { Dot, Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CauseArt } from "@/components/causes/CauseArt";
import { listActiveCauses } from "@/lib/causes";
import { getSuburb } from "@/lib/suburbs";
import { formatAUD } from "@/lib/data";
import { CATEGORY_COLOURS } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fundraising efforts — The Dollar Chain",
  description: "Every local cause the chain is backing — real fixes raised by the community, each with its own page and target.",
};

export default async function CausesIndex() {
  const all = (await listActiveCauses()).filter((c) => c.id !== "c-where-needed");
  const member = all.filter((c) => c.source === "member");
  const curated = all.filter((c) => c.source === "curated");

  return (
    <main className="min-h-screen bg-cream">
      <SiteNav />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl font-semibold tracking-tight">Fundraising efforts</h1>
            <p className="text-muted mt-3 text-lg max-w-2xl">
              Every cause the chain is backing — real local fixes, each with its own page, target and location.
              Open one to send your $1 there.
            </p>
          </div>
          <Link href="/causes/new"><Button className="inline-flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add a cause</Button></Link>
        </div>

        {member.length > 0 && (
          <Section title="Raised by the community" causes={member} />
        )}
        <Section title="Standing causes" causes={curated} />
      </div>
      <SiteFooter />
    </main>
  );
}

function Section({ title, causes }: { title: string; causes: Awaited<ReturnType<typeof listActiveCauses>> }) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold mb-5">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {causes.map((c) => {
          const target = c.targetCents ?? 0;
          const raised = c.raisedCents ?? 0;
          const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
          const suburbName = c.suburb ? getSuburb(c.suburb)?.name : null;
          return (
            <Link key={c.id} href={`/causes/${c.id}`}
              className="group bg-white border border-border rounded-card overflow-hidden hover:border-ink/30 hover:-translate-y-0.5 transition-all">
              <div className="aspect-[16/10] overflow-hidden border-b border-border">
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
                  {suburbName && <><span>·</span><span>{suburbName}</span></>}
                </div>
                <h3 className="font-semibold leading-snug group-hover:text-accent transition-colors">{c.title}</h3>
                <p className="text-sm text-muted mt-1 line-clamp-2">{c.description}</p>
                {c.locationLabel && (
                  <div className="mt-2 text-[11px] text-muted inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{c.locationLabel}</div>
                )}
                {target > 0 && (
                  <div className="mt-3">
                    <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[11px] text-muted mt-1 tabular">{formatAUD(raised)} of {formatAUD(target)}</div>
                  </div>
                )}
                {c.source === "member" && <Badge tone="muted" className="!text-[10px] !py-0 mt-2">Member-submitted</Badge>}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
