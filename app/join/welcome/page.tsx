"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Share2, Coins } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/Button";
import { ChainPerson } from "@/components/chain/ChainPerson";
import { useJoinStore } from "@/store/joinStore";
import { useMe } from "@/lib/useMe";

export default function WelcomePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-cream" />}>
      <Welcome />
    </Suspense>
  );
}

function Welcome() {
  const params = useSearchParams();
  const fromQuery = parseInt(params.get("n") || "", 10);
  const s = useJoinStore();
  const { me } = useMe();
  const memberNumber = fromQuery || me?.memberNumber || s.assignedNumber;

  const [fired, setFired] = useState(false);
  useEffect(() => {
    if (fired) return;
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.4 }, colors: ["#0E9F6E", "#FFFFFF", "#0A0A0A"] });
    setFired(true);
  }, [fired]);

  const shareText = encodeURIComponent(
    `I'm #${memberNumber} in The Dollar Chain. $1 a week funding real help for real people. Join me 🔗`
  );

  return (
    <main className="min-h-screen bg-cream">
      <SiteNav />
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
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
            size="lg"
            isActive
          />
        </motion.div>
        <div className="mt-6 font-mono tabular text-5xl font-semibold">#{memberNumber.toLocaleString()}</div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">You're in the chain.</h1>
        <p className="text-muted mt-2">
          Your first payment unlocked{" "}
          <span className="inline-flex items-center gap-1 text-accent font-medium">
            <Coins className="w-4 h-4" />1 vote credit
          </span>{" "}
          for this week. By default we put your $1 where it's needed most — or you can split it
          across the causes you care about.
        </p>

        <SetPasswordCard />

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/account"><Button>Choose where your $1 goes →</Button></Link>
          <a href={`https://twitter.com/intent/tweet?text=${shareText}`} target="_blank" rel="noreferrer">
            <Button variant="secondary"><Share2 className="w-4 h-4" /> Share</Button>
          </a>
        </div>
        <div className="mt-3 text-sm flex items-center justify-center gap-4">
          <Link href="/account" className="text-muted hover:text-ink">Your account</Link>
          <Link href={`/chain/${memberNumber}`} className="text-muted hover:text-ink">See your page</Link>
        </div>
      </div>
    </main>
  );
}

function SetPasswordCard() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setBusy(true);
    const r = await fetch("/api/auth/set-password", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) { setError(j.error || "Couldn't set password."); return; }
    setDone(true);
  };

  if (done) {
    return (
      <div className="mt-8 max-w-sm mx-auto rounded-card border border-emerald-100 bg-emerald-50 p-5 text-sm text-ink">
        ✓ Password set. You can log in any time with your email and this password.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 max-w-sm mx-auto text-left rounded-card border border-border bg-white p-5 shadow-soft">
      <div className="font-semibold mb-1">Finish signing up</div>
      <p className="text-sm text-muted mb-3">
        Create a password so you can log back in to manage your subscription, vote, and edit your figure.
      </p>
      <input
        type="password" value={password} onChange={(e) => setPassword(e.target.value)}
        placeholder="Choose a password (8+ characters)" autoComplete="new-password"
        className="w-full h-11 px-3 mb-2 rounded-xl border border-border focus:outline-none focus:border-accent"
      />
      <input
        type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
        placeholder="Confirm password" autoComplete="new-password"
        className="w-full h-11 px-3 rounded-xl border border-border focus:outline-none focus:border-accent"
      />
      {error && <div className="text-sm text-danger mt-2">{error}</div>}
      <Button type="submit" className="w-full mt-3" disabled={busy || !password}>
        {busy ? "Saving…" : "Set my password"}
      </Button>
    </form>
  );
}
