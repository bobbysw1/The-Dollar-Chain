"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, ShieldCheck, Vote, Coins } from "lucide-react";
import Link from "next/link";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface FAQ { q: string; a: string }

const SECTIONS: { heading: string; items: FAQ[] }[] = [
  {
    heading: "The basics",
    items: [
      {
        q: "What is The Dollar Chain?",
        a: "An open Australian community fund. Everyone pays $1, dedicated to a suburb of your choice (we're piloting on the southern Gold Coast). Members suggest anything that needs funding — a kid's sports trip, kits for an under-12s team, a knee reconstruction, a marching band, a foreshore cleanup, a rough sleeper's first night indoors — and the chain votes. The most-voted asks get paid out.",
      },
      {
        q: "Why $1?",
        a: "Because $1 is small enough that anyone can join — a teenager, a pensioner, someone on a tight budget — and large enough that, with a few thousand of us, it funds real work every single week.",
      },
      {
        q: "How often do I get charged?",
        a: "Whichever you pick: $1 every week, $1 every fortnight, or $1 every month. Change or cancel any time from your account email.",
      },
      {
        q: "What is the number?",
        a: "When you join, you're given the next number in the chain — #1, #2, #1,247, and so on. It's your place. Your number is yours for as long as you keep donating. If you ever stop, you don't disappear: you become the latest link in the chain — the most important one, because that's where the chain grows on from. Your number is held for you to pick straight back up.",
      },
    ],
  },
  {
    heading: "Where the money goes",
    items: [
      {
        q: "What kinds of things do you fund?",
        a: "Anything the chain votes on. Real recent examples span civic and personal: motel nights for a family escaping an unsafe home, gloves and bags for a Palm Beach foreshore cleanup, flights to California for a 14-year-old surfer to compete, knee reconstruction co-pay for an amateur rugby player, kits for an under-12s NRL team, the community hall hire for a weekly marching band, mowing for elderly neighbours, potholes the council was too slow on, funeral costs for a sole parent's mother.",
      },
      {
        q: "How are decisions made?",
        a: "Each successful $1 payment earns you 1 vote credit for that week. You can spend it on one of the shortlisted causes, or on a member-suggested issue. The cause with the most votes by Sunday midnight gets that week's pot.",
      },
      {
        q: "Can I suggest an issue?",
        a: "Yes — that's the point. Anyone in the chain can submit a suggestion (issue title, brief context, category). Other members upvote with their credits. Top-voted suggestions enter the next week's shortlist.",
      },
      {
        q: "How do I know the money was actually used?",
        a: "Every funded project is logged on the Impact page with the amount used, date, category, and a description. Where we can, we publish a photo or an anonymous recipient quote. Receipts and invoices are kept on file for audit.",
      },
    ],
  },
  {
    heading: "Money + trust",
    items: [
      {
        q: "How much of my dollar actually reaches the cause?",
        a: "90% of every donation funds local projects. 10% covers running costs — hosting, the part-time coordinator, the boring stuff. Before that split, Stripe takes its processing fee: on a $1 weekly charge that's about 30¢, which is why we give you the option to bundle weekly or fortnightly dollars into a single monthly charge — it's your choice, never automatic. Paying by BECS Direct Debit (bank-to-bank) is cheaper again. See the full per-plan fee table on the join page.",
      },
      {
        q: "Why does Stripe take a fee at all?",
        a: "Every card or bank payment has a processing cost — there's no way around it. Stripe charges roughly 1.75% + 30¢ per card payment. That fixed 30¢ hurts most on tiny charges, so a single $1 loses about a third to fees. We get around it by batching: $1/week is charged as one $4 payment a month, so the 30¢ only lands once. That's why weekly-billed-monthly is our recommended plan.",
      },
      {
        q: "Is this a registered charity?",
        a: "We're operating as a not-for-profit while we work through DGR registration. Once registered, contributions over a certain threshold will be tax-deductible.",
      },
      {
        q: "Who handles the money, and how do I know it's safe?",
        a: "All payments are processed by Stripe and flow into a dedicated Australian bank account. That account is linked live to our Transparency page — the balance and every single transaction are public and update automatically. There's no monthly delay and no 'trust us': you can check exactly where every dollar is, any time.",
      },
      {
        q: "What happens if I cancel?",
        a: "Your subscription stops immediately — no fuss, no guilt. You keep your number, and you become the latest link in the chain: still part of the story, ready to grow it again whenever you like. Pick back up any time.",
      },
    ],
  },
  {
    heading: "Where it runs",
    items: [
      {
        q: "Why start on the southern Gold Coast?",
        a: "Because this is where we live. The pilot covers 15 suburbs from Mermaid Beach down to Coolangatta. Each member picks the suburb their $1 is dedicated to, and that suburb has its own pot. Once we've proven the model here, the platform expands to wherever members start a new chapter.",
      },
      {
        q: "I live elsewhere in Australia — can I still join?",
        a: "Absolutely. Join from anywhere, pick whichever southern Gold Coast suburb you want to back. Many of our members are people who grew up here and want to give back to where they're from.",
      },
      {
        q: "Will you expand beyond the southern Gold Coast?",
        a: "Yes — the model is designed to spread. Once we have a thriving chain here, we'll open dedicated chapters in other Australian regions. Members can start sister chains in their own suburbs.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-cream">
      <SiteNav />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Badge tone="accent" className="mb-4">FAQ</Badge>
        <h1 className="text-5xl font-semibold tracking-tight">Frequently asked</h1>
        <p className="text-muted mt-3 text-lg max-w-xl">
          The honest version. If something isn't covered here, email{" "}
          <a href="mailto:hello@dollarchain.org" className="text-accent hover:underline">hello@dollarchain.org</a>.
        </p>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <TrustChip icon={<MapPin className="w-4 h-4" />} label="Southern Gold Coast pilot" />
          <TrustChip icon={<Coins className="w-4 h-4" />} label="90% to projects" />
          <TrustChip icon={<Vote className="w-4 h-4" />} label="Members vote weekly" />
          <TrustChip icon={<ShieldCheck className="w-4 h-4" />} label="Stripe + trust account" />
        </div>

        <div className="mt-12 space-y-12">
          {SECTIONS.map((sec) => (
            <section key={sec.heading}>
              <h2 className="text-xl font-semibold mb-4">{sec.heading}</h2>
              <div className="divide-y divide-border border border-border rounded-card bg-white">
                {sec.items.map((it) => <Row key={it.q} {...it} />)}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-card border border-border bg-surface text-center">
          <h3 className="text-2xl font-semibold mb-2">Ready to join?</h3>
          <p className="text-muted mb-4">One dollar. Your number. Real change.</p>
          <Link href="/join"><Button size="lg">Join the Chain</Button></Link>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

function Row({ q, a }: FAQ) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 hover:bg-surface/50 transition-colors"
      >
        <span className="font-medium">{q}</span>
        <ChevronDown className={`w-4 h-4 text-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-muted leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TrustChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border text-sm">
      <span className="text-accent">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
