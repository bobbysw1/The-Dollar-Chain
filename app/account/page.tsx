"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Coins, Heart, Share2, CreditCard, Settings, Sliders, Check, Plus, Minus, Copy, LogOut, Sparkles,
} from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { Button } from "@/components/ui/Button";
import { Badge, Dot } from "@/components/ui/Badge";
import { ChainPerson } from "@/components/chain/ChainPerson";
import { AvatarEditor } from "@/components/customise/AvatarEditor";
import { CauseArt } from "@/components/causes/CauseArt";
import { SUBURBS, getSuburb } from "@/lib/suburbs";
import {
  SKIN_TONES, SHIRT_COLOURS, HAIR_COLOURS, HAIR_STYLES, ACCESSORIES,
  CATEGORY_COLOURS, planMetaFor,
  MIN_ALLOCATION_PCT, MAX_ALLOCATION_SLICES,
  type PersonAppearance, type Allocation, type HairStyle, type Accessory, type ProjectCategory,
} from "@/lib/types";

interface Cause {
  id: string; title: string; description: string; category: string;
  source: "curated" | "member"; suggestedBy?: number;
  images?: string[]; targetCents?: number;
}
interface Member {
  number: number; email: string; plan: string; joinedAt: string;
  displayName?: string; city?: string; dedicatedSuburb?: string; notify: boolean;
  avatar: PersonAppearance; autoAllocate: boolean; allocations: Allocation[];
  referralCode: string; referralCount: number;
  contributedCents: number; projectsHelped: string[]; active: boolean;
  stripeCustomerId?: string;
}

const fmt = (c: number) => `$${(c / 100).toLocaleString("en-AU", { minimumFractionDigits: c % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<Member | null>(null);
  const [causes, setCauses] = useState<Cause[]>([]);

  const load = useCallback(async () => {
    const r = await fetch("/api/account", { cache: "no-store" });
    const j = await r.json();
    if (j.authenticated) { setMember(j.member); setCauses(j.causes); }
    else { setMember(null); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <main className="min-h-screen bg-cream"><SiteNav />
        <div className="max-w-3xl mx-auto px-6 py-24 text-center text-muted">Loading your account…</div>
      </main>
    );
  }

  if (!member) return <SignedOut onChange={load} />;

  return (
    <main className="min-h-screen bg-cream">
      <SiteNav />
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        <AccountHeader member={member} onChange={load} />
        <ImpactSection member={member} causes={causes} />
        <AllocationSection member={member} causes={causes} onChange={load} />
        <AvatarSection member={member} onChange={load} />
        <ReferralSection member={member} />
        <SettingsSection member={member} onChange={load} />
        <SubscriptionSection member={member} />
      </div>
      <SiteFooter />
    </main>
  );
}

/* ---------------- signed out ---------------- */

function SignedOut({ onChange }: { onChange: () => void }) {
  const [num, setNum] = useState("");
  return (
    <main className="min-h-screen bg-cream"><SiteNav />
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Your account</h1>
        <p className="text-muted mt-3">Join the chain to get your number and manage everything here.</p>
        <Link href="/join"><Button size="lg" className="mt-6">Join the Chain</Button></Link>
        {process.env.NODE_ENV !== "production" && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const n = parseInt(num.replace(/[^\d]/g, ""), 10);
              if (!n) return;
              await fetch("/api/auth/dev-login", {
                method: "POST", headers: { "content-type": "application/json" },
                body: JSON.stringify({ memberNumber: n, credits: 2 }),
              });
              onChange();
            }}
            className="mt-10 flex items-center gap-2 justify-center"
          >
            <input value={num} onChange={(e) => setNum(e.target.value)} placeholder="Dev: sign in as #"
              className="h-9 w-44 px-3 text-sm rounded-lg border border-border focus:outline-none focus:border-accent" />
            <button className="h-9 px-3 text-sm rounded-lg bg-ink text-white">Go</button>
          </form>
        )}
      </div>
    </main>
  );
}

/* ---------------- header ---------------- */

function AccountHeader({ member, onChange }: { member: Member; onChange: () => void }) {
  return (
    <div className="flex items-center gap-5 pb-2">
      <ChainPerson {...member.avatar} number={member.number} isActive={member.active} size="md" />
      <div className="flex-1">
        <div className="font-mono tabular text-3xl font-semibold">#{member.number}</div>
        <div className="text-muted text-sm">
          {member.displayName ? `${member.displayName} · ` : ""}
          {getSuburb(member.dedicatedSuburb || "")?.name || "Southern Gold Coast"}
        </div>
        <Badge tone={member.active ? "success" : "muted"} className="mt-1.5">
          <Dot color={member.active ? "#16A34A" : "#0E9F6E"} /> {member.active ? "Active link" : "The latest link"}
        </Badge>
      </div>
      <button
        onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); onChange(); }}
        className="text-xs text-muted hover:text-ink inline-flex items-center gap-1"
      >
        <LogOut className="w-3.5 h-3.5" /> Sign out
      </button>
    </div>
  );
}

/* ---------------- impact / digest ---------------- */

function ImpactSection({ member, causes }: { member: Member; causes: Cause[] }) {
  const helped = member.projectsHelped
    .map((id) => causes.find((c) => c.id === id))
    .filter(Boolean) as Cause[];
  return (
    <Section icon={<Heart className="w-4 h-4" />} title="Your dollar so far">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Contributed" value={fmt(member.contributedCents)} />
        <Stat label="Projects helped" value={String(member.projectsHelped.length)} />
        <Stat label="Member since" value={new Date(member.joinedAt).toLocaleDateString("en-AU", { month: "short", year: "numeric" })} />
      </div>
      {helped.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-muted mb-2">You've helped fund:</div>
          <div className="flex flex-wrap gap-2">
            {helped.map((c) => (
              <span key={c.id} className="inline-flex items-center gap-1.5 text-sm border border-border rounded-full px-3 py-1">
                <Dot color={CATEGORY_COLOURS[c.category as keyof typeof CATEGORY_COLOURS] || "#71717A"} />{c.title}
              </span>
            ))}
          </div>
        </div>
      )}
      <p className="mt-4 text-xs text-muted">
        {member.notify
          ? "We'll email you each month with exactly where your money went and how many people the chain helped."
          : "Turn on monthly emails below to get a note each month showing where your money went."}
      </p>
    </Section>
  );
}

/* ---------------- allocation ---------------- */

function AllocationSection({ member, causes, onChange }: { member: Member; causes: Cause[]; onChange: () => void }) {
  const selectableCauses = causes.filter((c) => c.id !== "c-where-needed");
  // Manual allocations must point at real, selectable causes (not the auto pseudo-cause).
  const initialManual = (() => {
    const valid = member.allocations.filter((a) => selectableCauses.some((c) => c.id === a.causeId));
    if (valid.length) return valid;
    return [{ causeId: selectableCauses[0]?.id ?? "", pct: 100 }];
  })();

  const [auto, setAuto] = useState(member.autoAllocate);
  const [allocs, setAllocs] = useState<Allocation[]>(initialManual);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const total = allocs.reduce((s, a) => s + a.pct, 0);

  const toggleCause = (id: string) => {
    setAllocs((prev) => {
      if (prev.some((a) => a.causeId === id)) return prev.filter((a) => a.causeId !== id);
      if (prev.length >= MAX_ALLOCATION_SLICES) return prev;
      return [...prev, { causeId: id, pct: MIN_ALLOCATION_PCT }];
    });
  };
  const setPctById = (id: string, delta: number) =>
    setAllocs((prev) => prev.map((a) => a.causeId === id
      ? { ...a, pct: Math.max(MIN_ALLOCATION_PCT, Math.min(100, a.pct + delta)) } : a));

  const save = async () => {
    setSaving(true); setMsg(null);
    const r = await fetch("/api/account", {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ autoAllocate: auto, allocations: auto ? [{ causeId: "c-where-needed", pct: 100 }] : allocs }),
    });
    const j = await r.json();
    setSaving(false);
    if (!r.ok) { setMsg(j.error || "Couldn't save."); return; }
    setMsg("Saved.");
    onChange();
  };

  return (
    <Section icon={<Sliders className="w-4 h-4" />} title="Where your $1 goes">
      <p className="text-sm text-muted mb-4">
        Split your dollar across the causes you care about — minimum $0.20 each, up to {MAX_ALLOCATION_SLICES} causes.
        Or let the chain decide.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <TierToggle
          title="Auto-allocate"
          sub="We put it where it's needed most, following the weekly vote."
          selected={auto}
          onClick={() => setAuto(true)}
        />
        <TierToggle
          title="I'll choose"
          sub="Divide your $1 across specific causes yourself."
          selected={!auto}
          onClick={() => setAuto(false)}
        />
      </div>

      {!auto && (
        <div className="space-y-4">
          <p className="text-xs text-muted">Tap causes to back them, then split your dollar. Open any cause for its full story.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectableCauses.map((c) => {
              const idx = allocs.findIndex((a) => a.causeId === c.id);
              const on = idx >= 0;
              return (
                <div key={c.id}
                  className={`rounded-xl border overflow-hidden transition-all ${on ? "border-accent ring-1 ring-accent/30" : "border-border hover:border-ink/30"}`}>
                  <button onClick={() => toggleCause(c.id)} className="block w-full text-left">
                    {c.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.images[0]} alt="" className="w-full h-24 object-cover" />
                    ) : (
                      <CauseArt category={c.category as ProjectCategory} className="w-full h-24" />
                    )}
                    <div className="flex items-start gap-2 p-3">
                      <span className={`mt-0.5 w-4 h-4 rounded grid place-items-center text-[10px] shrink-0 ${on ? "bg-accent text-white" : "border border-border text-transparent"}`}>✓</span>
                      <span className="text-sm font-medium leading-snug">{c.title}</span>
                    </div>
                  </button>
                  <div className="px-3 pb-3 flex items-center justify-between gap-2">
                    <Link href={`/causes/${c.id}`} className="text-xs text-accent hover:underline shrink-0">View page →</Link>
                    {on && (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setPctById(c.id, -MIN_ALLOCATION_PCT)} className="w-6 h-6 grid place-items-center rounded border border-border hover:bg-surface"><Minus className="w-3 h-3" /></button>
                        <span className="w-10 text-center font-mono tabular text-xs">{fmt(allocs[idx].pct)}</span>
                        <button onClick={() => setPctById(c.id, MIN_ALLOCATION_PCT)} className="w-6 h-6 grid place-items-center rounded border border-border hover:bg-surface"><Plus className="w-3 h-3" /></button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <Link href="/causes/new" className="text-sm text-accent hover:underline inline-flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add a new cause
            </Link>
            <span className={`text-sm font-mono tabular ${total === 100 ? "text-success" : "text-danger"}`}>
              {fmt(total)} of $1.00
            </span>
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        <Button onClick={save} disabled={saving || (!auto && total !== 100)}>
          {saving ? "Saving…" : "Save allocation"}
        </Button>
        {msg && <span className={`text-sm ${msg === "Saved." ? "text-success" : "text-danger"}`}>{msg}</span>}
      </div>
    </Section>
  );
}

/* ---------------- avatar ---------------- */

function AvatarSection({ member, onChange }: { member: Member; onChange: () => void }) {
  const [av, setAv] = useState<PersonAppearance>(member.avatar);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true); setSaved(false);
    await fetch("/api/account", {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ avatar: av }),
    });
    setSaving(false); setSaved(true);
    onChange();
  };

  return (
    <Section icon={<Sparkles className="w-4 h-4" />} title="Your figure in the chain">
      <AvatarEditor value={av} number={member.number} onChange={(patch) => setAv({ ...av, ...patch })} />
      <div className="flex items-center gap-3 mt-5">
        <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save figure"}</Button>
        {saved && <span className="text-sm text-success">Saved.</span>}
      </div>
    </Section>
  );
}

/* ---------------- referrals ---------------- */

function ReferralSection({ member }: { member: Member }) {
  const [copied, setCopied] = useState(false);
  const link = useMemo(() =>
    typeof window !== "undefined" ? `${window.location.origin}/join?ref=${member.referralCode}` : `/join?ref=${member.referralCode}`,
    [member.referralCode]);

  return (
    <Section icon={<Share2 className="w-4 h-4" />} title="Refer a friend">
      <p className="text-sm text-muted mb-4">
        Share your link. When someone joins through it, you both get a bonus vote credit — and the chain grows.
        You've referred <strong className="text-ink tabular">{member.referralCount}</strong> {member.referralCount === 1 ? "person" : "people"}.
      </p>
      <div className="flex items-center gap-2">
        <input readOnly value={link} className="flex-1 h-10 px-3 text-sm rounded-lg border border-border bg-surface font-mono" />
        <Button variant="secondary" onClick={() => { navigator.clipboard?.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </Section>
  );
}

/* ---------------- settings ---------------- */

function SettingsSection({ member, onChange }: { member: Member; onChange: () => void }) {
  const [displayName, setDisplayName] = useState(member.displayName ?? "");
  const [city, setCity] = useState(member.city ?? "");
  const [suburb, setSuburb] = useState(member.dedicatedSuburb ?? "palm-beach");
  const [notify, setNotify] = useState(member.notify);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true); setSaved(false);
    await fetch("/api/account", {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ displayName, city, dedicatedSuburb: suburb, notify }),
    });
    setSaving(false); setSaved(true); onChange();
  };

  return (
    <Section icon={<Settings className="w-4 h-4" />} title="Settings">
      <div className="space-y-4">
        <Field label="Display name">
          <input value={displayName} maxLength={40} onChange={(e) => setDisplayName(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
        </Field>
        <Field label="Town / city">
          <input value={city} maxLength={60} onChange={(e) => setCity(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
        </Field>
        <Field label="Dedicated suburb">
          <select value={suburb} onChange={(e) => setSuburb(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-border bg-white focus:outline-none focus:border-accent">
            {SUBURBS.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
        </Field>
        <label className="flex items-center gap-3 py-1">
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="w-4 h-4 accent-accent" />
          <span className="text-sm">Email me each month where my money went</span>
        </label>
        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save settings"}</Button>
          {saved && <span className="text-sm text-success">Saved.</span>}
        </div>
      </div>
    </Section>
  );
}

/* ---------------- subscription ---------------- */

function SubscriptionSection({ member }: { member: Member }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showRetention, setShowRetention] = useState(false);
  const plan = (() => { try { return planMetaFor(member.plan as never).label; } catch { return member.plan; } })();

  // Opens Stripe's portal in a NEW TAB so the member keeps this page open.
  const openPortal = async () => {
    setBusy(true); setErr(null);
    // Open the tab synchronously (before the await) so the browser doesn't block it as a popup.
    const tab = window.open("", "_blank");
    const r = await fetch("/api/billing/portal", { method: "POST" });
    const j = await r.json();
    setBusy(false);
    if (!r.ok || !j.url) {
      tab?.close();
      setErr(j.error === "no_customer" ? "No billing record yet (dev account)." : j.error || "Billing isn't set up yet.");
      return;
    }
    if (tab) tab.location.href = j.url; else window.open(j.url, "_blank");
    setShowRetention(false);
  };

  return (
    <Section icon={<CreditCard className="w-4 h-4" />} title="Subscription & billing">
      <div className="flex items-center justify-between p-4 rounded-xl border border-border">
        <div>
          <div className="font-medium">{plan}</div>
          <div className="text-xs text-muted">Card saved securely with Stripe · renews automatically</div>
        </div>
        <Button variant="secondary" onClick={() => { setErr(null); setShowRetention(true); }} disabled={busy}>
          Manage / cancel
        </Button>
      </div>
      {err && <p className="mt-2 text-xs text-muted">{err}</p>}
      <p className="mt-3 text-xs text-muted">
        Update your card, switch payment method, download invoices, or cancel any time —
        all handled securely in Stripe's portal (opens in a new tab). Cancel and you keep your number — you simply become the latest link in the chain.
      </p>

      {showRetention && (
        <RetentionModal
          member={member}
          busy={busy}
          onClose={() => setShowRetention(false)}
          onContinue={openPortal}
        />
      )}
    </Section>
  );
}

function RetentionModal({ member, busy, onClose, onContinue }: {
  member: Member; busy: boolean; onClose: () => void; onContinue: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-card shadow-soft w-full max-w-md overflow-hidden">
        <div className="px-6 pt-7 pb-5 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 text-accent grid place-items-center mb-4">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight">Before you go, #{member.number}…</h3>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            Your dollar isn&apos;t just a dollar. It&apos;s a kid getting to the comp, a family
            keeping the lights on, a rough night turned into a warm bed — chosen by people
            like you, every single week.
          </p>
          <p className="mt-3 text-sm text-ink font-medium leading-relaxed">
            &ldquo;With you in the chain, we can actually change things around here.
            Stay with us — even a dollar keeps it going.&rdquo;
          </p>
          <p className="mt-1 text-xs text-muted">— everyone your $1 has helped</p>
        </div>
        <div className="px-6 pb-6 space-y-2">
          <Button className="w-full" onClick={onClose}>Keep my number — I&apos;m staying</Button>
          <button
            onClick={onContinue}
            disabled={busy}
            className="w-full h-10 rounded-xl text-sm text-muted hover:text-ink hover:bg-surface transition-colors disabled:opacity-60"
          >
            {busy ? "Opening…" : "Continue to manage or cancel"}
          </button>
          <p className="text-center text-[11px] text-muted pt-1">
            Opens Stripe&apos;s secure portal in a new tab. You keep your number either way.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- shared bits ---------------- */

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="border border-border rounded-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-8 h-8 rounded-lg bg-emerald-50 text-accent grid place-items-center">{icon}</span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface rounded-xl p-4">
      <div className="text-xl font-semibold tabular">{value}</div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="text-sm font-medium mb-1.5">{label}</div>{children}</div>;
}

function TierToggle({ title, sub, selected, onClick }: { title: string; sub: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`text-left p-4 rounded-xl border transition-all ${selected ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-ink/30"}`}>
      <div className="flex items-center justify-between">
        <span className="font-medium">{title}</span>
        {selected && <span className="w-5 h-5 rounded-full bg-accent text-white grid place-items-center"><Check className="w-3 h-3" /></span>}
      </div>
      <p className="text-xs text-muted mt-1">{sub}</p>
    </button>
  );
}

function Swatches({ label, options, value, onPick }: { label: string; options: string[]; value: string; onPick: (v: string) => void }) {
  return (
    <div>
      <div className="text-xs text-muted mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((c) => (
          <button key={c} onClick={() => onPick(c)} aria-label={c}
            className={`w-7 h-7 rounded-full transition-transform ${value === c ? "ring-2 ring-offset-2 ring-ink scale-110" : "hover:scale-105"}`}
            style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}

function Pills({ label, options, value, onPick }: { label: string; options: readonly string[]; value: string; onPick: (v: string) => void }) {
  return (
    <div>
      <div className="text-xs text-muted mb-1.5">{label}</div>
      <div className="inline-flex flex-wrap gap-1 p-1 bg-surface rounded-xl border border-border">
        {options.map((o) => (
          <button key={o} onClick={() => onPick(o)}
            className={`px-3 h-8 text-sm rounded-lg capitalize transition-colors ${value === o ? "bg-white text-ink shadow-sm font-medium" : "text-muted hover:text-ink"}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
