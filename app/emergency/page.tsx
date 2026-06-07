import Link from "next/link";
import type { Metadata } from "next";
import { ShieldAlert, Lock, Vote, Eye, Heart } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getPublicStats } from "@/lib/members";
import { fundSplit, EMERGENCY_COVERS } from "@/lib/fund";
import { formatAUD } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Emergency Fund — The Dollar Chain",
  description:
    "10% of every donation (after costs) is ring-fenced coast-wide for genuine crises — escaping family violence, single parents in crisis, natural-disaster and homelessness relief.",
};

export default async function EmergencyPage() {
  const stats = await getPublicStats();
  const split = fundSplit(stats.contributedCents); // contributedCents = net (after fees)

  return (
    <main className="min-h-screen bg-cream">
      <SiteNav />

      {/* HERO */}
      <section className="border-b border-rose-100 bg-gradient-to-br from-rose-50 to-amber-50">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <Badge tone="muted" className="mb-4 !bg-rose-100 !text-rose-700">
            <ShieldAlert className="w-3 h-3" /> Coast-wide safety net
          </Badge>
          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight">The Emergency Fund</h1>
          <p className="mt-5 text-lg text-ink/80 max-w-2xl">
            Some things can&apos;t wait for a weekly vote. So <strong>10% of every donation</strong> (after running
            costs) is set aside, coast-wide, ready to move fast when a local hits a genuine crisis.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="rounded-card border border-rose-200 bg-white px-5 py-3">
              <div className="text-xs text-muted">In the Emergency Fund now</div>
              <div className="text-2xl font-semibold tabular">{formatAUD(split.emergency)}</div>
            </div>
            <p className="text-sm text-muted max-w-sm">
              It grows with every dollar given. Nothing&apos;s been drawn yet — every grant will be logged on the{" "}
              <Link href="/transparency" className="text-accent hover:underline">Transparency</Link> page.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-14 space-y-16">
        {/* WHAT IT COVERS */}
        <section>
          <h2 className="text-3xl font-semibold tracking-tight">What it&apos;s for</h2>
          <p className="text-muted mt-2 max-w-2xl">Real, can&apos;t-wait emergencies for people in our community. Things like:</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EMERGENCY_COVERS.map((c) => (
              <div key={c.title} className="rounded-card border border-border bg-white p-5">
                <div className="flex items-start gap-3">
                  <Heart className="w-4 h-4 text-rose-500 mt-1 shrink-0" />
                  <div>
                    <div className="font-medium">{c.title}</div>
                    <div className="text-sm text-muted mt-1">{c.detail}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-4">
            This isn&apos;t an exhaustive list — if it&apos;s a genuine emergency for a local, the trustees can help.
          </p>
        </section>

        {/* HOW IT'S FUNDED */}
        <section>
          <h2 className="text-3xl font-semibold tracking-tight">How it&apos;s funded</h2>
          <p className="text-muted mt-2 max-w-2xl">
            Every dollar, after the payment processor&apos;s fee, is split like this:
          </p>
          <div className="mt-6 rounded-card border border-border bg-white divide-y divide-border">
            <SplitRow label="Keeps the lights on (running costs)" pct="10%" sub="Hosting, the coordinator, the boring essentials." />
            <SplitRow label="The Emergency Fund" pct="10%" sub="Of what's left — ring-fenced coast-wide for crises." highlight />
            <SplitRow label="Your suburb's local causes" pct="~80%" sub="The things your suburb votes to fund each week." />
          </div>
          <p className="text-xs text-muted mt-3">
            So 90% of every donation still goes to causes — one tenth of that is the coast-wide Emergency Fund, the rest stays local.
          </p>
        </section>

        {/* HOW IT WORKS / GOVERNANCE */}
        <section>
          <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Feature icon={<Vote className="w-4 h-4" />} title="No waiting for a vote" body="Emergencies can't wait a week. Trustees can release help fast, at their discretion." />
            <Feature icon={<Lock className="w-4 h-4" />} title="Private & dignified" body="Especially for family-violence situations — handled discreetly, with specialist support services, never named publicly." />
            <Feature icon={<Eye className="w-4 h-4" />} title="Still accountable" body="Every grant is logged on the Transparency page (amount and category — never identifying details)." />
          </div>
        </section>

        {/* NEED HELP / REFER */}
        <section className="rounded-card border border-border bg-surface p-8">
          <h2 className="text-2xl font-semibold">Need help, or know someone who does?</h2>
          <p className="text-muted mt-2 max-w-2xl">
            Reach out in confidence and we&apos;ll do what we can, quickly. You can ask for yourself or refer someone else.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a href="mailto:help@dollarchain.org"><Button>Contact us in confidence</Button></a>
            <span className="text-sm text-muted">help@dollarchain.org</span>
          </div>
          <p className="text-xs text-muted mt-4">
            In immediate danger, always call <strong>000</strong>. For family-violence support any time, 1800RESPECT
            (<strong>1800 737 732</strong>). The Dollar Chain is a community fund, not an emergency service.
          </p>
        </section>

        <div className="text-center">
          <Link href="/join"><Button size="lg">Add your $1 — grow the safety net</Button></Link>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

function SplitRow({ label, pct, sub, highlight }: { label: string; pct: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 px-5 py-4 ${highlight ? "bg-rose-50/60" : ""}`}>
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-sm text-muted">{sub}</div>
      </div>
      <div className={`text-2xl font-semibold tabular shrink-0 ${highlight ? "text-rose-600" : ""}`}>{pct}</div>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-card border border-border bg-white p-5">
      <span className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 grid place-items-center mb-3">{icon}</span>
      <div className="font-medium">{title}</div>
      <div className="text-sm text-muted mt-1">{body}</div>
    </div>
  );
}
