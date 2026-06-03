import Link from "next/link";
import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { Badge, Dot } from "@/components/ui/Badge";
import { SUBURBS } from "@/lib/suburbs";
import { CATEGORY_COLOURS } from "@/lib/types";
import { formatAUD } from "@/lib/data";

export const metadata: Metadata = {
  title: "Southern Gold Coast suburbs — The Dollar Chain",
  description: "Local chapters across the southern Gold Coast — Palm Beach, Burleigh, Currumbin, Coolangatta and more.",
};

export default function LocalIndex() {
  const totalMembers = SUBURBS.reduce((s, x) => s + x.memberCount, 0);
  const totalDeployed = SUBURBS.reduce((s, x) => s + x.amountDeployedCents, 0);
  return (
    <main className="min-h-screen bg-cream">
      <SiteNav />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <Badge tone="accent" className="mb-4"><MapPin className="w-3 h-3" /> Southern Gold Coast</Badge>
        <h1 className="text-5xl font-semibold tracking-tight">Your suburb.</h1>
        <p className="mt-4 text-lg text-muted max-w-2xl">
          Local people, local projects. Each suburb has its own pot and its own page — the money
          raised by a suburb's members goes back into that suburb. Most people back where they live.
          But if somewhere nearby needs it more, you're free to send your $1 there instead.
        </p>

        <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted">
          <span><strong className="text-ink tabular">{SUBURBS.length}</strong> suburbs</span>
          <span><strong className="text-ink tabular">{totalMembers.toLocaleString()}</strong> members</span>
          <span><strong className="text-ink tabular">{formatAUD(totalDeployed)}</strong> deployed locally</span>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUBURBS.map((s) => (
            <Link
              key={s.slug}
              href={`/local/${s.slug}`}
              className="group bg-white border border-border rounded-card p-5 hover:border-ink/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold group-hover:text-accent transition-colors">{s.name}</h2>
                <span className="text-xs text-muted font-mono tabular">{s.postcode}</span>
              </div>
              <p className="text-sm text-muted mt-2 line-clamp-2">{s.intro}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {s.priorityCategories.slice(0, 3).map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 text-[11px] text-muted border border-border rounded-full px-2 py-0.5">
                    <Dot color={CATEGORY_COLOURS[c]} />{c}
                  </span>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted">
                <span><strong className="text-ink tabular">{s.memberCount}</strong> members</span>
                <span><strong className="text-ink tabular">{formatAUD(s.amountDeployedCents)}</strong> deployed</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
