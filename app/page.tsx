import Link from "next/link";
import { MapPin, ShieldCheck, Vote, Coins, Eye } from "lucide-react";
import { SnakeChain } from "@/components/chain/SnakeChain";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { CountUp } from "@/components/CountUp";
import { Button } from "@/components/ui/Button";
import { Badge, Dot } from "@/components/ui/Badge";
import { MOCK_PROJECTS, formatAUD, formatDate, chainOrdered } from "@/lib/data";
import { listPublicMembers, getPublicStats } from "@/lib/members";
import { SUBURBS } from "@/lib/suburbs";
import { CATEGORY_COLOURS, ALL_CATEGORIES } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Never let a transient database hiccup turn the homepage into an error page.
  // If the read fails (e.g. a cold-start blip), render with safe fallbacks.
  let members: Awaited<ReturnType<typeof listPublicMembers>> = [];
  let stats: Awaited<ReturnType<typeof getPublicStats>> = {
    total: 1, active: 1, nextNumber: 2, contributedCents: 0, suburbsBacked: 0,
  };
  try {
    [members, stats] = await Promise.all([listPublicMembers(), getPublicStats()]);
  } catch (e) {
    console.error("Homepage data load failed — rendering fallback", e);
  }
  const raisedCents = stats.contributedCents;
  return (
    <main className="relative min-h-screen">
      {/* flowing colour wash across the top of the page */}
      <div aria-hidden className="flow-bg pointer-events-none absolute inset-x-0 top-0 h-[100vh] z-0" />
      <SnakeChain members={chainOrdered(members)} position="absolute" bgOpacity={0.5} seed={1} />
      <SiteNav />

      {/* HERO */}
      <section className="relative z-10 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-24">
        <div className="relative max-w-column w-full text-center">
          <div aria-hidden className="absolute inset-0 -inset-x-12 -inset-y-12 bg-cream/70 rounded-[44px] blur-2xl" />
          <div className="relative">
            <Badge tone="accent" className="mb-6">
              <MapPin className="w-3 h-3" /> Australia · Southern Gold Coast pilot
            </Badge>
            <h1 className="text-5xl sm:text-7xl font-semibold tracking-tight leading-[1.05]">
              One dollar.<br />
              Your number.<br />
              <span className="text-accent">Anything we vote on.</span>
            </h1>
            <p className="mt-6 text-lg text-muted max-w-xl mx-auto">
              An open Australian community fund. Everyone pays $1.
              Dedicate it to any southern Gold Coast suburb. Members vote each week
              on what gets funded — kid's sports trip, footy team kits, knee surgery,
              a rough sleeper's first night indoors, a marching band, anything.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link href="/join"><Button size="lg">Join the Chain</Button></Link>
              <Link href="/projects"><Button size="lg" variant="secondary">See the impact</Button></Link>
            </div>
            <p className="mt-6 text-sm text-muted">
              <span aria-hidden>⛓</span>{" "}
              {stats.total === 1 ? "1 person in the chain — be the next link" : <><CountUp to={stats.total} /> people in the chain</>}
            </p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative z-10 bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <Stat label="People in the chain" value={<CountUp to={stats.total} />} />
          <Stat label="Raised so far" value={<CountUp to={raisedCents / 100} prefix="$" />} />
          <Stat label="Projects funded" value={<CountUp to={MOCK_PROJECTS.length} />} />
        </div>
      </section>

      {/* MISSION */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge tone="accent" className="mb-4">How it works</Badge>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight">
              An Australian fund. You decide where it goes.
            </h2>
            <p className="mt-5 text-lg text-muted">
              We're starting on the southern Gold Coast — 15 suburbs from Mermaid down to Coolangatta.
              Pick the suburb you want your $1 dedicated to. Members suggest anything that needs
              funding. The chain votes. The most-voted asks get paid out, every week.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/local"><Button variant="secondary">Browse the suburbs</Button></Link>
              <Link href="/projects" className="text-sm text-accent hover:underline">See what we've funded →</Link>
            </div>
          </div>
          <div className="rounded-card border border-border bg-white p-6">
            <div className="text-sm font-medium text-muted mb-4">Pick your suburb</div>
            <div className="flex flex-wrap gap-2">
              {SUBURBS.slice(0, 10).map((sb) => (
                <Link
                  key={sb.slug}
                  href={`/local/${sb.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm border border-border rounded-full px-3 py-1.5 hover:border-accent hover:text-accent transition-colors"
                >
                  {sb.name}
                </Link>
              ))}
              <Link
                href="/local"
                className="inline-flex items-center gap-1.5 text-sm rounded-full px-3 py-1.5 text-accent hover:underline"
              >
                + {SUBURBS.length - 10} more →
              </Link>
            </div>
            <p className="mt-5 text-xs text-muted">
              Local people, local projects. Dedicate your $1 to where you live — or send it
              to a suburb that needs it more.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Step n="01" title="Pick a cadence + suburb" body="$1/week, fortnight, month, or year. Choose any southern Gold Coast suburb to dedicate it to." />
          <Step n="02" title="Customise your figure" body="Your number is yours while you give — stop, and you're the latest link in the chain." />
          <Step n="03" title="Vote on anything" body="Suggest an ask, or vote on someone else's. Kid's sport, knee surgery, beach cleanup — anything." />
        </div>
      </section>

      {/* CAUSES */}
      <section className="relative z-10 bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            We fund whatever the chain votes on.
          </h2>
          <p className="text-muted mt-3 max-w-2xl">
            A kid's interstate sports trip. Kits for the local under-12s. Knee reconstruction for an amateur footballer.
            A weekly marching band. A rough sleeper's first night indoors. If members suggest it and others upvote
            it, we fund it. Below: the categories we've actually paid out so far.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((c) => (
              <span key={c} className="inline-flex items-center gap-2 bg-white border border-border rounded-full px-3 py-1.5 text-sm">
                <Dot color={CATEGORY_COLOURS[c]} />{c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
          Built for trust
        </h2>
        <p className="text-muted mb-10 max-w-2xl">
          We're a tiny team on the southern Gold Coast. Our bank account is linked live to the
          Transparency page — anyone can see exactly where every dollar is, in real time.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TrustCard icon={<Coins className="w-5 h-5" />} title="90% to projects*" body="90¢ of every dollar — after unavoidable processing fees — funds local projects. 10¢ covers running costs." />
          <TrustCard icon={<Vote className="w-5 h-5" />} title="Members decide" body="Every $1 earns 1 vote. No board picks the winners — the chain does." />
          <TrustCard icon={<Eye className="w-5 h-5" />} title="Live bank feed" body="Our account balance and every transaction are published live on the Transparency page. Nothing hidden, nothing delayed." />
          <TrustCard icon={<ShieldCheck className="w-5 h-5" />} title="Secured by Stripe" body="Card and bank (BECS Direct Debit) payments are processed by Stripe. We never see your card details." />
        </div>
        <p className="mt-6 text-sm text-muted max-w-3xl">
          <span className="text-ink font-medium">*</span> Payment processing fees are unavoidable. That's why we
          recommend <strong className="text-ink">$4 a month in a single payment</strong> — it keeps the most of
          your donation for the cause. Want to do $1 a week instead? Totally fine.{" "}
          <Link href="/transparency" className="text-accent hover:underline">See the live ledger →</Link>
        </p>
      </section>

      {/* RECENT */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Recently funded</h2>
          <Link href="/projects" className="text-sm text-accent hover:underline">All projects →</Link>
        </div>
        {MOCK_PROJECTS.length === 0 ? (
          <div className="rounded-card border border-dashed border-border bg-white/60 p-10 text-center">
            <h3 className="text-xl font-semibold">Nothing funded yet — and that's the honest truth.</h3>
            <p className="text-muted mt-2 max-w-md mx-auto">
              We're just starting. The first project gets funded the moment there are enough $1s in the
              pot and the chain has voted. Every one we fund will be logged right here.
            </p>
            <Link href="/join" className="mt-5 inline-block"><Button>Be part of the first one</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_PROJECTS.slice(0, 6).map((p) => (
              <article key={p.id} className="bg-white border border-border rounded-card overflow-hidden hover:border-ink/20 transition-colors">
                <div className="h-1.5 w-full" style={{ background: CATEGORY_COLOURS[p.category] }} aria-hidden />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2 text-xs text-muted">
                    <Dot color={CATEGORY_COLOURS[p.category]} />
                    <span>{p.category}</span>
                    <span>•</span>
                    <span className="font-mono tabular">{formatDate(p.date)}</span>
                  </div>
                  <h3 className="font-semibold text-base leading-snug">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted line-clamp-2">{p.description}</p>
                  <p className="mt-3 text-xs text-muted">
                    {formatAUD(p.amountCents)} — members #{p.fundedByRange[0]}–#{p.fundedByRange[1]}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20 pt-8 text-center">
        <div className="relative overflow-hidden p-12 rounded-3xl bg-flow-green text-white shadow-lift">
          <div aria-hidden className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
          <div aria-hidden className="absolute -left-12 -bottom-12 w-56 h-56 rounded-full bg-white/10" />
          <div className="relative">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Add your dollar.</h2>
            <p className="text-white/85 mt-3 text-lg">Your number is permanent. Your vote counts every week. Start today.</p>
            <div className="mt-7 flex items-center justify-center gap-3">
              <Link href="/join"><Button size="lg" variant="secondary">Join the Chain</Button></Link>
              <Link href="/faq" className="text-white/90 hover:text-white text-sm font-medium underline underline-offset-4">Read the FAQ</Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="font-display text-4xl font-extrabold tracking-tight text-accent">{value}</div>
      <div className="text-sm text-muted mt-1">{label}</div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div>
      <div className="font-display font-extrabold text-5xl text-emerald-200 tabular mb-3">{n}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted">{body}</p>
    </div>
  );
}

function TrustCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="bg-white border border-border rounded-card p-5">
      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-accent grid place-items-center mb-3">{icon}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted">{body}</p>
    </div>
  );
}
