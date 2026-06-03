"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock, ArrowLeft, Share2, Coffee, Info } from "lucide-react";
import confetti from "canvas-confetti";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/Button";
import { ChainPerson } from "@/components/chain/ChainPerson";
import { CustomiseYourPerson } from "@/components/customise/CustomiseYourPerson";
import { useJoinStore } from "@/store/joinStore";
import { PLANS, planMetaFor, feeFor, feeForAmount, keepPct, chargeFor, planHasBoost, type Plan, type PaymentMethod, type Tier } from "@/lib/types";
import { formatAUD } from "@/lib/data";
import { SUBURBS, getSuburb } from "@/lib/suburbs";
import { CreditCard, Building2, Sparkles, MapPin } from "lucide-react";

export default function JoinPage() {
  const s = useJoinStore();
  // Pick up ?ref= (referral) and ?suburb= from the URL without needing Suspense.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const ref = p.get("ref");
    const suburb = p.get("suburb");
    const patch: Record<string, string> = {};
    if (ref) patch.referredByCode = ref.toUpperCase().slice(0, 12);
    if (suburb && SUBURBS.some((sb) => sb.slug === suburb)) patch.dedicatedSuburb = suburb;
    if (Object.keys(patch).length) s.set(patch);
    // Fetch the real next number in the chain so we don't show a fake one.
    fetch("/api/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => { if (j.nextNumber) s.set({ assignedNumber: j.nextNumber }); })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <main className="relative min-h-screen bg-cream">
      <div aria-hidden className="flow-bg pointer-events-none absolute inset-x-0 top-0 h-[360px] z-0" />
      <SiteNav />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <StepIndicator step={s.step} total={4} />
        <AnimatePresence mode="wait">
          <motion.div
            key={s.step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            {s.step === 1 && <Step1 />}
            {s.step === 2 && <Step2 />}
            {s.step === 3 && <Step3 />}
            {s.step === 4 && <Step4 />}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-10 text-sm text-muted">
      <span className="tabular">Step {step} of {total}</span>
      <div className="flex-1 h-1 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function Step1() {
  const { plan, paymentMethod, tier, customWeeklyCents, set, next } = useJoinStore();
  const [showMore, setShowMore] = useState(false);
  const selected = planMetaFor(plan);
  const usingCustom = customWeeklyCents >= 100;
  const totalCharged = usingCustom ? customWeeklyCents : chargeFor(selected, tier);
  const unitLabel = usingCustom ? "week" : selected.unit;
  const fee = feeForAmount(totalCharged, paymentMethod);
  // What lands with the chain after Stripe — donor-facing "to causes" figure.
  const toCausesTotal = totalCharged - fee;

  const coverOn = !usingCustom && tier === "boosted";
  const reachesPct = usingCustom
    ? Math.round((toCausesTotal / totalCharged) * 100)
    : keepPct(selected, paymentMethod, tier);

  return (
    <div>
      <h1 className="text-4xl font-semibold tracking-tight mb-2">Set up your dollar</h1>
      <p className="text-muted mb-8">
        A dollar a week — a tiny amount you won't even notice — pooled into something that genuinely
        helps. Three quick choices.
      </p>

      {/* ── 1. Pay with ── */}
      <Step n="1" title="How would you like to pay?">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <MethodCard
            icon={<CreditCard className="w-4 h-4" />}
            title="Card"
            sub="Visa / Mastercard / Amex — instant"
            fee="Most common"
            selected={paymentMethod === "card"}
            onClick={() => set({ paymentMethod: "card" })}
          />
          <MethodCard
            icon={<Building2 className="w-4 h-4" />}
            title="Bank (BECS Direct Debit)"
            sub="Straight from your AU bank — lower fees"
            fee="Cheaper for the cause"
            selected={paymentMethod === "becs"}
            onClick={() => set({ paymentMethod: "becs" })}
          />
        </div>
      </Step>

      {/* ── 2. Amount ── */}
      <Step n="2" title="How much, and how often?">
        <div className="space-y-2">
          {PLANS.map((p) => (
            <AmountRow
              key={p.id}
              plan={p}
              method={paymentMethod}
              selected={!usingCustom && plan === p.id}
              onClick={() => { set({ plan: p.id, customWeeklyCents: 0 }); setShowMore(false); }}
            />
          ))}
        </div>

        {/* give more — gently discouraged */}
        {!showMore && !usingCustom ? (
          <button onClick={() => setShowMore(true)} className="mt-3 text-sm text-accent hover:underline">
            Want to give more?
          </button>
        ) : (
          <div className="mt-3 p-4 rounded-card border border-border bg-surface">
            <div className="font-medium mb-1">Honestly? We'd rather you didn't.</div>
            <p className="text-sm text-muted">
              The magic is that <strong className="text-ink">everyone gives the same tiny dollar</strong> —
              an amount you won't notice — and together we make a real difference. No big donors, no
              heroes. But if you truly want to, name your weekly amount.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-muted">$</span>
              <input
                type="number" min="1" step="0.50"
                value={usingCustom ? (customWeeklyCents / 100).toString() : ""}
                onChange={(e) => {
                  const v = Math.round(parseFloat(e.target.value || "0") * 100);
                  set({ customWeeklyCents: v >= 100 ? v : 0 });
                }}
                placeholder="1.00"
                className="w-28 h-10 px-3 rounded-xl border border-border focus:outline-none focus:border-accent"
              />
              <span className="text-muted text-sm">/ week</span>
              <button
                onClick={() => { set({ customWeeklyCents: 0 }); setShowMore(false); }}
                className="ml-2 text-sm text-muted hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Step>

      {/* ── 3. Cover the fee (default on, opt-out) ── */}
      {!usingCustom && (
        <Step n="3" title="Cover the tiny Stripe fee?">
          <label className={`flex items-start gap-3 p-4 rounded-card border cursor-pointer transition-colors ${coverOn ? "border-accent bg-emerald-50/50" : "border-border bg-white"}`}>
            <input
              type="checkbox"
              checked={coverOn}
              onChange={(e) => set({ tier: e.target.checked ? "boosted" : "standard" })}
              className="mt-0.5 w-4 h-4 accent-accent shrink-0"
            />
            <div className="text-sm">
              <div className="font-medium">
                Add 30¢ so we keep your full {selected.label.split(" / ")[0]}
                <span className="text-muted font-normal"> — you pay {selected.boostedLabel}</span>
              </div>
              <p className="text-muted mt-0.5">
                Stripe takes a fixed ~30¢ per payment. Tick this and that comes from you, not the cause.
                Leave it unticked and it simply comes out of your dollar — totally fine either way.
              </p>
            </div>
          </label>
        </Step>
      )}

      {/* summary + continue */}
      <div className="mt-8 p-5 rounded-card bg-flow-green text-white flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-sm text-white/80">You'll give</div>
          <div className="text-2xl font-extrabold">
            {formatAUD(totalCharged)} <span className="text-white/80 text-base font-medium">/ {unitLabel}</span>
          </div>
          <div className="text-xs text-white/80 mt-0.5">
            ~{reachesPct}% reaches the causes after fees · cancel any time
          </div>
        </div>
        <Button size="lg" variant="secondary" onClick={next}>Continue →</Button>
      </div>
    </div>
  );
}

/** A numbered cascade section. */
function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-6 rounded-full bg-accent text-white text-xs font-bold grid place-items-center">{n}</span>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/** A full-width selectable amount row. */
function AmountRow({ plan, method, selected, onClick }: {
  plan: ReturnType<typeof planMetaFor>;
  method: PaymentMethod;
  selected: boolean;
  onClick: () => void;
}) {
  const pct = keepPct(plan, method);
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 p-4 rounded-card border transition-all ${
        selected ? "border-accent ring-2 ring-accent/20 bg-emerald-50/40" : "border-border hover:border-ink/30"
      }`}
    >
      <span className={`w-5 h-5 rounded-full border-2 grid place-items-center shrink-0 ${selected ? "border-accent" : "border-border"}`}>
        {selected && <span className="w-2.5 h-2.5 rounded-full bg-accent" />}
      </span>
      <span className="flex-1">
        <span className="font-semibold">{plan.label}</span>
        {plan.recommended && (
          <span className="ml-2 text-[11px] font-medium bg-accent/10 text-accent px-2 py-0.5 rounded-full align-middle">Popular</span>
        )}
        <span className="block text-xs text-muted mt-0.5">{plan.blurb} · ~{pct}% reaches causes</span>
      </span>
    </button>
  );
}

function PlanCard({ plan, method, selected, onClick }: {
  plan: ReturnType<typeof planMetaFor>;
  method: PaymentMethod;
  selected: boolean;
  onClick: () => void;
}) {
  const pct = keepPct(plan, method);
  return (
    <button
      onClick={onClick}
      className={`relative text-left p-5 rounded-card border transition-all ${
        selected ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-ink/30"
      }`}
    >
      {plan.recommended && (
        <span className="absolute -top-2 left-4 inline-flex items-center gap-1 text-[11px] font-medium bg-accent text-white px-2 py-0.5 rounded-full">
          Recommended
        </span>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">{plan.label}</div>
          <div className="text-xs text-muted mt-0.5">
            {plan.chargesPerYear === 1
              ? `One charge a year`
              : `${formatAUD(plan.chargeCents)} × ${plan.chargesPerYear} a year`}{" "}
            — {formatAUD(plan.annualCents)}/yr
          </div>
        </div>
        {selected && (
          <div className="w-6 h-6 rounded-full bg-accent text-white grid place-items-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            pct >= 90 ? "bg-green-50 text-green-700" :
            pct >= 80 ? "bg-yellow-50 text-yellow-700" :
            "bg-orange-50 text-orange-700"
          }`}
        >
          {pct}% to causes ({method.toUpperCase()})
        </span>
      </div>
      <p className="text-xs text-muted mt-2">{plan.blurb}</p>
    </button>
  );
}

function TierCard({ title, sub, footer, selected, onClick, highlight }: {
  title: string; sub: string; footer: string;
  selected: boolean; onClick: () => void; highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left p-4 rounded-card border transition-all ${
        selected
          ? highlight
            ? "border-accent ring-2 ring-accent/30 bg-emerald-50/40"
            : "border-accent ring-2 ring-accent/20"
          : "border-border hover:border-ink/30"
      }`}
    >
      {highlight && (
        <span className="absolute -top-2 left-4 inline-flex items-center gap-1 text-[11px] font-medium bg-accent text-white px-2 py-0.5 rounded-full">
          <Sparkles className="w-3 h-3" /> 100%
        </span>
      )}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xl font-semibold">{title}</div>
          <div className="text-xs text-muted mt-0.5">{sub}</div>
        </div>
        {selected && (
          <span className="w-5 h-5 rounded-full bg-accent text-white grid place-items-center">
            <Check className="w-3 h-3" />
          </span>
        )}
      </div>
      <p className="text-xs text-muted mt-2">{footer}</p>
    </button>
  );
}

function MethodCard({ icon, title, sub, fee, selected, onClick }: {
  icon: React.ReactNode; title: string; sub: string; fee: string;
  selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-card border transition-all ${
        selected ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-ink/30"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <span className="text-accent">{icon}</span>{title}
        </div>
        {selected && (
          <span className="w-5 h-5 rounded-full bg-accent text-white grid place-items-center">
            <Check className="w-3 h-3" />
          </span>
        )}
      </div>
      <p className="text-xs text-muted mt-1">{sub}</p>
      <div className="text-xs font-mono tabular text-muted mt-2">{fee}</div>
    </button>
  );
}

function Bar({ label, amount, total, color }: { label: string; amount: number; total: number; color: string }) {
  const pct = Math.round((amount / total) * 100);
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex items-center justify-between text-xs mb-1">
        <span>{label}</span>
        <span className="font-mono tabular text-muted">{formatAUD(amount)} · {pct}%</span>
      </div>
      <div className="h-2 bg-surface rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function FeeTable({ currentPlan, method }: { currentPlan: Plan; method: PaymentMethod }) {
  return (
    <div className="mt-6 border border-border rounded-card overflow-hidden bg-white">
      <div className="px-5 py-3 border-b border-border bg-surface text-sm font-medium flex items-center justify-between flex-wrap gap-2">
        <span>Fee comparison — what reaches your causes per charge</span>
        <span className="text-xs text-muted font-normal">
          Card: 1.75% + 30¢ +GST · BECS: 1% + 30¢ (cap $3.50) +GST
        </span>
      </div>
      <table className="w-full text-sm">
        <thead className="text-xs text-muted">
          <tr className="border-b border-border">
            <th className="text-left px-5 py-2 font-medium">Plan</th>
            <th className="text-right px-5 py-2 font-medium">Charge</th>
            <th className="text-right px-5 py-2 font-medium">Card fee</th>
            <th className="text-right px-5 py-2 font-medium">To causes (card)</th>
            <th className="text-right px-5 py-2 font-medium">BECS fee</th>
            <th className="text-right px-5 py-2 font-medium">To causes (BECS)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {PLANS.map((p) => {
            const cardPct = keepPct(p, "card");
            const becsPct = keepPct(p, "becs");
            const isRow = currentPlan === p.id;
            return (
              <tr key={p.id} className={isRow ? "bg-emerald-50/40" : ""}>
                <td className="px-5 py-2.5">{p.label}{isRow && (
                  <span className="ml-2 text-[10px] uppercase text-accent font-medium">selected</span>
                )}</td>
                <td className="px-5 py-2.5 text-right tabular">{formatAUD(p.chargeCents)}</td>
                <td className={`px-5 py-2.5 text-right tabular ${method === "card" ? "text-ink" : "text-muted"}`}>−{formatAUD(p.cardFeeCents)}</td>
                <td className={`px-5 py-2.5 text-right tabular ${method === "card" ? "font-medium" : "text-muted"}`}>
                  {formatAUD(p.chargeCents - p.cardFeeCents)} <span className="text-muted text-xs">({cardPct}%)</span>
                </td>
                <td className={`px-5 py-2.5 text-right tabular ${method === "becs" ? "text-ink" : "text-muted"}`}>−{formatAUD(p.becsFeeCents)}</td>
                <td className={`px-5 py-2.5 text-right tabular ${method === "becs" ? "font-medium" : "text-muted"}`}>
                  {formatAUD(p.chargeCents - p.becsFeeCents)} <span className="text-muted text-xs">({becsPct}%)</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Step2() {
  const { next, prev, assignedNumber } = useJoinStore();
  return (
    <div>
      <h1 className="text-4xl font-semibold tracking-tight mb-2">Make it yours</h1>
      <p className="text-muted mb-8">
        Your number will be <span className="font-mono tabular text-ink">#{assignedNumber.toLocaleString()}</span>
      </p>
      <CustomiseYourPerson />
      <div className="mt-10 flex justify-between">
        <Button variant="ghost" onClick={prev}><ArrowLeft className="w-4 h-4" /> Back</Button>
        <Button size="lg" onClick={next}>Looks good →</Button>
      </div>
    </div>
  );
}

function Step3() {
  const s = useJoinStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cadence = planMetaFor(s.plan).label;

  const goToCheckout = async () => {
    setBusy(true); setError(null);
    const payload = {
      plan: s.plan,
      email: s.email,
      paymentMethod: s.paymentMethod,
      tier: s.tier,
      customWeeklyCents: s.customWeeklyCents,
      dedicatedSuburb: s.dedicatedSuburb,
      displayName: s.displayName,
      city: s.city,
      avatar: {
        skinTone: s.skinTone, shirtColour: s.shirtColour, hairColour: s.hairColour,
        hairStyle: s.hairStyle, build: s.build, accessories: s.accessories,
        photoUrl: s.photoUrl || undefined, photoStatus: s.photoUrl ? "pending" : undefined,
        photoPlacement: s.photoUrl ? (s.photoPlacement ?? "full") : undefined,
        photoShape: s.photoUrl ? s.photoShape : undefined,
      },
      referredByCode: s.referredByCode,
    };
    try {
      const r = await fetch("/api/checkout", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (r.ok && j.url) { window.location.href = j.url; return; }

      // Stripe not configured yet → simulate the donation so the flow works end-to-end.
      if (r.status === 503) {
        const dev = await fetch("/api/dev/pledge", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const dj = await dev.json();
        if (dev.ok && dj.redirect) { window.location.href = dj.redirect; return; }
        setError(dj.error || "Couldn't complete sign-up.");
        setBusy(false);
        return;
      }
      setError(j.error || "Couldn't start checkout.");
      setBusy(false);
    } catch (e) {
      setError("Network error");
      setBusy(false);
    }
  };
  return (
    <div>
      <h1 className="text-4xl font-semibold tracking-tight mb-2">Almost there</h1>
      <p className="text-muted mb-8">We only need an email — no password.</p>
      <div className="space-y-4">
        <Field label="Dedicate your $1 to…">
          <select
            value={s.dedicatedSuburb}
            onChange={(e) => s.set({ dedicatedSuburb: e.target.value })}
            className="w-full h-12 px-4 rounded-xl border border-border bg-white focus:outline-none focus:border-accent"
          >
            {SUBURBS.map((sb) => (
              <option key={sb.slug} value={sb.slug}>{sb.name}{sb.postcode ? ` · ${sb.postcode}` : ""}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            Your $1 joins this suburb's pot. You can change this any time.
          </p>
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={s.email}
            onChange={(e) => s.set({ email: e.target.value })}
            placeholder="you@example.com"
            className="w-full h-12 px-4 rounded-xl border border-border focus:outline-none focus:border-accent"
          />
        </Field>
        <Field label="Display name (optional)">
          <input
            value={s.displayName}
            maxLength={20}
            onChange={(e) => s.set({ displayName: e.target.value })}
            className="w-full h-12 px-4 rounded-xl border border-border focus:outline-none focus:border-accent"
          />
        </Field>
        <Field label="Town or city (optional)">
          <input
            value={s.city}
            onChange={(e) => s.set({ city: e.target.value })}
            className="w-full h-12 px-4 rounded-xl border border-border focus:outline-none focus:border-accent"
          />
        </Field>

        <label className="flex items-center gap-3 py-2">
          <input
            type="checkbox"
            checked={s.notify}
            onChange={(e) => s.set({ notify: e.target.checked })}
            className="w-4 h-4 accent-accent"
          />
          <span className="text-sm">Email me when my $1 helps someone</span>
        </label>

        <div className="mt-2 p-5 rounded-xl border border-border bg-surface text-sm text-muted space-y-2">
          <div>
            You'll be redirected to Stripe to enter your{" "}
            <strong className="text-ink">{s.paymentMethod === "card" ? "card" : "bank (BECS Direct Debit)"}</strong> details securely.
          </div>
          <div>
            Plan: <strong className="text-ink">{cadence}</strong>
            {s.tier === "boosted" && <> · Boosted to {planMetaFor(s.plan).boostedLabel} — thank you for covering the fee</>}
          </div>
          <div>
            Dedicated to: <strong className="text-ink">{getSuburb(s.dedicatedSuburb)?.name || s.dedicatedSuburb}</strong>
          </div>
          <div className="text-xs">Each successful payment earns you 1 vote credit for that week.</div>
        </div>
      </div>

      {error && <div className="mt-4 text-sm text-danger">{error}</div>}

      <div className="mt-8">
        <Button size="lg" className="w-full" onClick={goToCheckout} disabled={!s.email || busy}>
          {busy ? "Redirecting…" : `Continue to checkout — ${cadence}`}
        </Button>
        <p className="mt-3 text-xs text-muted flex items-center gap-1.5 justify-center">
          <Lock className="w-3 h-3" /> Secured by Stripe. Cancel anytime.
        </p>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={s.prev}><ArrowLeft className="w-4 h-4" /> Back</Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-medium mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function Step4() {
  const s = useJoinStore();

  useEffect(() => {
    confetti({
      particleCount: 80, spread: 70, origin: { y: 0.4 },
      colors: ["#0E9F6E", "#FFFFFF", "#0A0A0A"],
    });
  }, []);

  const shareText = encodeURIComponent(
    `I'm #${s.assignedNumber} in The Dollar Chain. $1 a week funding real help for real people. Join me 🔗`
  );

  return (
    <div className="text-center pt-8">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="inline-flex flex-col items-center"
      >
        <ChainPerson
          skinTone={s.skinTone}
          shirtColour={s.shirtColour}
          hairColour={s.hairColour}
          hairStyle={s.hairStyle}
          build={s.build}
          accessories={s.accessories}
          photoUrl={s.photoUrl || undefined}
          photoPlacement={s.photoPlacement}
          size="lg"
          isActive
        />
      </motion.div>
      <div className="mt-6 font-mono tabular text-5xl font-semibold">#{s.assignedNumber.toLocaleString()}</div>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">You're in the chain.</h1>
      <p className="text-muted mt-2">
        That's $52 a year for the chain — billed {planMetaFor(s.plan).label.toLowerCase()}.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <a
          href={`https://twitter.com/intent/tweet?text=${shareText}`}
          target="_blank" rel="noreferrer"
        >
          <Button variant="secondary"><Share2 className="w-4 h-4" /> Share</Button>
        </a>
        <Link href={`/chain/${s.assignedNumber}`}>
          <Button>See your page →</Button>
        </Link>
      </div>
    </div>
  );
}
