import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Privacy Policy — The Dollar Chain",
  description: "What we collect, why, and your rights. Plain English.",
};

const UPDATED = "2 June 2026";

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen bg-cream">
      <div aria-hidden className="flow-bg pointer-events-none absolute inset-x-0 top-0 h-[320px] z-0" />
      <SiteNav />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        <Badge tone="accent" className="mb-4">Privacy</Badge>
        <h1 className="text-5xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-4 text-lg text-muted">
          The plain-English version. We collect as little as we can, we never sell it, and you can
          ask us to delete it any time.
        </p>
        <p className="mt-2 text-sm text-muted">Last updated {UPDATED}</p>

        <div className="mt-10 space-y-8">
          <Section title="Who we are">
            The Dollar Chain is a not-for-profit community fund based on the southern Gold Coast,
            Queensland. In this policy &ldquo;we&rdquo; means The Dollar Chain. You can reach us at{" "}
            <a href="mailto:hello@dollarchain.org" className="text-accent hover:underline">hello@dollarchain.org</a>.
          </Section>

          <Section title="What we collect">
            <ul className="space-y-2">
              <Li><strong>Your email address</strong> — to create your account and send you updates you've opted into.</Li>
              <Li><strong>Optional profile details</strong> — display name, town/suburb, and your chain figure's appearance. You choose these and can change or remove them.</Li>
              <Li><strong>Your contribution & voting activity</strong> — your plan, your member number, which causes you allocate to and vote for.</Li>
              <Li><strong>Payment details are handled by Stripe, not us.</strong> We never see or store your full card or bank numbers — Stripe does, securely. We only keep a Stripe customer reference so your subscription works.</Li>
            </ul>
          </Section>

          <Section title="Why we collect it">
            To run your membership, take your $1, record where you've asked it to go, show your figure
            in the chain, and (only if you opt in) email you about where the money went. That's it.
          </Section>

          <Section title="What we never do">
            <ul className="space-y-2">
              <Li>We never sell or rent your data.</Li>
              <Li>We never share it for advertising.</Li>
              <Li>We never publish your email or payment details. Public pages only ever show your member number and the figure/name you chose.</Li>
            </ul>
          </Section>

          <Section title="Who we share it with">
            Only the services that make the site work: <strong>Stripe</strong> (payments),
            our <strong>hosting and database providers</strong>, and an <strong>email provider</strong> if
            you've opted into updates. Each only gets what they need to do their job. We may disclose
            information if the law genuinely requires it.
          </Section>

          <Section title="Your rights">
            You can ask us to show you what we hold, correct it, or delete it. Email{" "}
            <a href="mailto:hello@dollarchain.org" className="text-accent hover:underline">hello@dollarchain.org</a>{" "}
            and we'll action it. If you cancel, we keep your member number reserved but will remove
            personal details on request. We handle personal information consistent with the Australian
            Privacy Principles.
          </Section>

          <Section title="Cookies">
            We use one small sign-in cookie so you stay logged in, and your browser's local storage to
            remember things like your vote on a device. No third-party advertising or tracking cookies.
          </Section>

          <Section title="Changes">
            If we change this policy we'll update the date above and, for anything significant, let
            members know by email.
          </Section>
        </div>

        <div className="mt-12 flex items-center gap-4 text-sm">
          <Link href="/terms" className="text-accent hover:underline">Terms of Use →</Link>
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

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
      <span>{children}</span>
    </li>
  );
}
