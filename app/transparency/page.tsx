"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ChevronDown, ShieldCheck } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { Badge, Dot } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  MONTHLY_REPORTS, MOCK_PROJECTS, TRUST_ACCOUNT_NAME,
  formatAUD, formatDate, formatMonth,
  type MonthlyReport,
} from "@/lib/data";
import { CATEGORY_COLOURS } from "@/lib/types";
import { fundSplit } from "@/lib/fund";

const PROJECTS_BY_MONTH: Record<string, typeof MOCK_PROJECTS> = MOCK_PROJECTS.reduce((acc, p) => {
  const m = p.date.slice(0, 7);
  (acc[m] ||= []).push(p);
  return acc;
}, {} as Record<string, typeof MOCK_PROJECTS>);

export default function TransparencyPage() {
  const [stats, setStats] = useState({ raisedCents: 0, deployedCents: 0, balanceCents: 0, peopleHelped: 0 });
  useEffect(() => {
    fetch("/api/stats", { cache: "no-store" }).then((r) => r.json()).then(setStats).catch(() => {});
  }, []);
  const totalDeployed = stats.deployedCents;
  const split = fundSplit(stats.raisedCents); // raisedCents = net (after fees)

  return (
    <main className="relative min-h-screen bg-cream">
      <div aria-hidden className="flow-bg pointer-events-none absolute inset-x-0 top-0 h-[420px] z-0" />
      <SiteNav />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <Badge tone="accent" className="mb-4"><ShieldCheck className="w-3 h-3" /> Transparency</Badge>
        <h1 className="text-5xl font-semibold tracking-tight">Every dollar, accounted for.</h1>
        <p className="mt-4 text-lg text-muted max-w-2xl">
          We publish every transaction. <strong className="text-ink">90% of every donation, after processing fees*</strong>,
          goes to causes — your suburb&apos;s local projects plus the coast-wide{" "}
          <Link href="/emergency" className="text-accent hover:underline">Emergency Fund</Link>. The other{" "}
          <strong className="text-ink">10% covers running costs</strong> — hosting, a part-time coordinator, the boring
          stuff — so we can keep building. Inspired by{" "}
          <a href="https://blog.ecosia.org/category/financial-reports/" target="_blank" rel="noreferrer" className="text-accent hover:underline">Ecosia's monthly receipts</a>.
        </p>
        <p className="mt-3 text-sm text-muted max-w-2xl">
          <span className="text-ink font-medium">*</span> Card and bank processing fees are unavoidable — every
          payment processor charges them. That's why we recommend <strong className="text-ink">$4 a month in one
          payment</strong>: it keeps the largest share of your donation for the cause. Prefer $1 a week? That's
          completely fine too.
        </p>

        {/* Headline numbers */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <Headline label="Account balance" value={formatAUD(stats.balanceCents)} sub="live bank feed" live />
          <Headline label="All-time raised" value={formatAUD(stats.raisedCents)} sub="from members" />
          <Headline label="Emergency Fund" value={formatAUD(split.emergency)} sub="coast-wide safety net" />
          <Headline label="All-time deployed" value={formatAUD(totalDeployed)} sub="to projects" />
          <Headline label="People helped" value={String(stats.peopleHelped)} sub="directly" />
        </div>

        {/* Where the money goes */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold mb-4">Where your dollar goes</h2>
          <p className="text-muted mb-6 max-w-2xl">
            Of every $1 received (after card processing): 10¢ keeps the lights on, then 10% of what&apos;s left is
            set aside in the coast-wide <Link href="/emergency" className="text-accent hover:underline">Emergency Fund</Link>,
            and the rest funds your suburb&apos;s local projects. So 90% still goes to causes.
          </p>
          <div className="bg-white border border-border rounded-card p-6 space-y-5">
            <SplitBar label="Local projects (your suburb's weekly vote)" pct={81} color="#0E9F6E" right={formatAUD(split.local)} />
            <SplitBar label="Emergency Fund (coast-wide safety net)" pct={9} color="#E11D48" right={formatAUD(split.emergency)} />
            <SplitBar label="Operating costs (coordinator, hosting, fees)" pct={10} color="#0EA5E9" right={formatAUD(split.runningCosts)} />
          </div>
          <p className="mt-4 text-xs text-muted">
            Heads up: Stripe takes its processing fee <em>before</em> this split — on a $1 weekly charge that's
            about 30¢. That's why we offer the option to bundle weekly/fortnightly dollars into one
            monthly charge — it's the member's choice. See the{" "}
            <a href="/join" className="text-accent hover:underline">join page</a> for the full per-plan fee table.
          </p>
        </section>

        {/* Monthly reports */}
        <section className="mt-16">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-2xl font-semibold">Monthly reports</h2>
            <button
              onClick={() => alert("CSV export coming once we have real data flowing.")}
              className="text-sm text-accent inline-flex items-center gap-1 hover:underline"
            >
              <Download className="w-3.5 h-3.5" /> Download CSV
            </button>
          </div>
          <div className="border border-border rounded-card overflow-hidden bg-white divide-y divide-border">
            {MONTHLY_REPORTS.length === 0 ? (
              <div className="p-8 text-center text-muted">
                No reports yet — our first monthly receipt publishes at the end of our first month.
              </div>
            ) : (
              MONTHLY_REPORTS.map((r) => <ReportRow key={r.month} report={r} />)
            )}
          </div>
        </section>

        {/* Trust account */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-border rounded-card p-6">
            <h2 className="text-xl font-semibold mb-2">The account, live</h2>
            <p className="text-muted text-sm">
              Member payments flow via Stripe straight into a dedicated Australian bank account.
              That account is linked live to this page — the balance and every transaction below
              update automatically. There's no monthly delay and no &ldquo;trust us&rdquo;: you can
              see exactly where every dollar is, right now.
            </p>
            <dl className="mt-5 divide-y divide-border border-t border-border">
              <Row label="Account name" value={TRUST_ACCOUNT_NAME} />
              <Row label="Bank feed" value="Linked live · updates automatically" />
              <Row label="Transactions" value="Every payout listed below" />
              <Row label="Member money" value="Held separately from running costs" />
            </dl>
          </div>

          <div className="bg-white border border-border rounded-card p-6">
            <h2 className="text-xl font-semibold mb-2">Our promises</h2>
            <ul className="space-y-3 text-sm">
              <Promise>90% of every donation (after unavoidable processing fees) funds local projects. 10% (capped) covers running costs. We never raise it.</Promise>
              <Promise>Our bank account is linked live to this page — the balance and every transaction are public, in real time.</Promise>
              <Promise>Every funded project is logged on the Impact page with amount, date, recipient (anonymised), and receipts on file.</Promise>
              <Promise>Members vote on every spend. No one can override the chain's decision.</Promise>
              <Promise>If we ever can't keep these, we'll say so loudly — not quietly.</Promise>
            </ul>
          </div>
        </section>

        <div className="mt-20 p-8 rounded-card border border-border bg-surface text-center">
          <h3 className="text-2xl font-semibold mb-2">Spot something off?</h3>
          <p className="text-muted mb-4">
            Email <a href="mailto:transparency@dollarchain.org" className="text-accent hover:underline">transparency@dollarchain.org</a> and we'll respond within 48 hours.
          </p>
          <Link href="/faq"><Button variant="secondary">Read the FAQ</Button></Link>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

function Headline({ label, value, sub, live }: { label: string; value: string; sub: string; live?: boolean }) {
  return (
    <div className="bg-white border border-border rounded-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular">{value}</div>
      <div className="text-xs text-muted flex items-center gap-1.5">
        {live && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-success" /></span>}
        {sub}
      </div>
    </div>
  );
}

function SplitBar({ label, pct, color, right }: { label: string; pct: number; color: string; right: string }) {
  const width = Math.max(0, Math.min(100, pct));
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span>{label}</span>
        <span className="font-mono tabular text-muted text-xs">{right}</span>
      </div>
      <div className="h-2.5 bg-surface rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${width}%`, background: color }} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

function Promise({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function ReportRow({ report }: { report: MonthlyReport }) {
  const [open, setOpen] = useState(false);
  const totalCosts = report.costs.stripeFeesCents + report.costs.hostingCents + report.costs.coordinatorCents + report.costs.domainCents;
  const projects = PROJECTS_BY_MONTH[report.month] || [];
  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} className="w-full px-5 py-4 grid grid-cols-[1fr_120px_120px_24px] gap-4 items-center hover:bg-surface/50 transition-colors text-left">
        <div>
          <div className="font-medium">{formatMonth(report.month)}</div>
          <div className="text-xs text-muted">{report.projectsCount} projects funded</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted">Raised</div>
          <div className="font-mono tabular">{formatAUD(report.raisedCents)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted">Deployed</div>
          <div className="font-mono tabular text-accent">{formatAUD(report.deployedCents)}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-surface/40 border-t border-border"
          >
            <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MEMBER MONEY */}
              <div>
                <div className="text-xs uppercase tracking-wide text-muted mb-2">Member money</div>
                <dl className="text-sm divide-y divide-border border border-border rounded-lg bg-white">
                  <Row label="Contributions received" value={formatAUD(report.raisedCents)} />
                  <Row label="Deployed to projects" value={formatAUD(report.deployedCents)} />
                  <Row label="Rolled over to next month" value={formatAUD(report.rolledOverCents)} />
                  <Row label="Closing balance" value={formatAUD(report.closingBalanceCents)} />
                </dl>
                {projects.length > 0 && (
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {projects.map((p) => (
                      <li key={p.id} className="flex items-start gap-2">
                        <Dot color={CATEGORY_COLOURS[p.category]} className="mt-1.5" />
                        <span className="flex-1">
                          <Link href="/projects" className="hover:text-accent">{p.title}</Link>{" "}
                          <span className="text-muted text-xs">· {formatDate(p.date)}</span>
                        </span>
                        <span className="font-mono tabular text-xs text-muted">{formatAUD(p.amountCents)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* OPS COSTS */}
              <div>
                <div className="text-xs uppercase tracking-wide text-muted mb-2">Operating costs (covered by patrons)</div>
                <dl className="text-sm divide-y divide-border border border-border rounded-lg bg-white">
                  <Row label="Stripe fees" value={formatAUD(report.costs.stripeFeesCents)} />
                  <Row label="Hosting (Vercel)" value={formatAUD(report.costs.hostingCents)} />
                  <Row label="Coordinator stipend" value={formatAUD(report.costs.coordinatorCents)} />
                  <Row label="Domain + email" value={formatAUD(report.costs.domainCents)} />
                  <Row label="Total ops cost" value={formatAUD(totalCosts)} />
                </dl>
                {report.notes && <p className="text-xs text-muted mt-3 italic">{report.notes}</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

