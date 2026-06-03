import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Terms of Use — The Dollar Chain",
  description: "The deal between you and The Dollar Chain. Plain English.",
};

const UPDATED = "2 June 2026";

export default function TermsPage() {
  return (
    <main className="relative min-h-screen bg-cream">
      <div aria-hidden className="flow-bg pointer-events-none absolute inset-x-0 top-0 h-[320px] z-0" />
      <SiteNav />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        <Badge tone="accent" className="mb-4">Terms</Badge>
        <h1 className="text-5xl font-semibold tracking-tight">Terms of Use</h1>
        <p className="mt-4 text-lg text-muted">
          The straightforward version of the deal between you and The Dollar Chain.
        </p>
        <p className="mt-2 text-sm text-muted">Last updated {UPDATED}</p>

        <div className="mt-10 space-y-8">
          <Section title="What The Dollar Chain is">
            A not-for-profit community fund. You contribute $1 on a schedule you choose. Members
            collectively vote on which local causes that money goes to. We pool the contributions and
            pay out to the causes the chain selects.
          </Section>

          <Section title="Your contribution is a donation">
            When you contribute, you're making a <strong>donation to the community fund</strong>, not
            buying a product or a guaranteed service. You don't get a personal benefit in return, and a
            contribution isn't refundable once it's been pooled and deployed — though you can cancel
            future payments any time.
          </Section>

          <Section title="How the money is split">
            <strong>90% of every donation goes to local causes; 10% covers running costs</strong>{" "}
            (hosting, payment fees, a part-time coordinator). Payment processing fees are taken by
            Stripe before that split. We publish the numbers on the{" "}
            <Link href="/transparency" className="text-accent hover:underline">Transparency page</Link>.
          </Section>

          <Section title="Voting & allocation">
            You can let us allocate your $1 automatically, or split it across causes yourself (minimum
            $0.20 per cause). Voting is one member, one vote per cycle. We facilitate the vote in good
            faith but reserve the right to decline funding anything unlawful, unsafe, or that we
            reasonably believe to be fraudulent or against the spirit of the fund.
          </Section>

          <Section title="Your number & figure">
            Your member number is yours for as long as you keep donating. If you stop, you become the
            latest link in the chain and your number is held for you to return to. Keep your figure and
            display name reasonable — nothing offensive, misleading, or impersonating someone else. We
            can remove content that breaks this.
          </Section>

          <Section title="Cancelling">
            Cancel any time from your account or via the Stripe portal. Cancellation stops future
            payments; it doesn't claw back contributions already pooled or paid out. You keep your
            number and become the latest link in the chain — ready to pick back up whenever you like.
          </Section>

          <Section title="No guarantees on outcomes">
            We work hard to deploy funds responsibly and transparently, but we can't guarantee a
            specific outcome for any cause, or that a cause you voted for will be the one funded in a
            given week — the chain decides collectively.
          </Section>

          <Section title="Liability">
            We provide the service &ldquo;as is&rdquo;. To the extent the law allows, we're not liable
            for indirect or consequential loss. Nothing here excludes rights you have under the
            Australian Consumer Law that can't be excluded.
          </Section>

          <Section title="Changes & contact">
            We may update these terms; we'll change the date above and flag anything significant to
            members. Questions:{" "}
            <a href="mailto:hello@dollarchain.org" className="text-accent hover:underline">hello@dollarchain.org</a>.
          </Section>
        </div>

        <div className="mt-12 flex items-center gap-4 text-sm">
          <Link href="/privacy" className="text-accent hover:underline">Privacy Policy →</Link>
          <Link href="/faq" className="text-accent hover:underline">FAQ →</Link>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-border rounded-card p-6 shadow-soft">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="text-muted leading-relaxed">{children}</div>
    </section>
  );
}
