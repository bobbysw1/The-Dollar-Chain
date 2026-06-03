"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useMe } from "@/lib/useMe";

/** "Send my $1 here" — points the signed-in member's whole dollar at this cause.
 *  Signed-out visitors are sent to join. */
export function BackCauseButton({ causeId, title }: { causeId: string; title: string }) {
  const { me } = useMe();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const back = async () => {
    if (!me?.authenticated) { router.push(`/join`); return; }
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/account", {
        method: "PATCH", headers: { "content-type": "application/json" },
        body: JSON.stringify({ autoAllocate: false, allocations: [{ causeId, pct: 100 }] }),
      });
      const j = await r.json();
      if (!r.ok) { setErr(j.error || "Couldn't update."); return; }
      setDone(true);
    } catch {
      setErr("Network error.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-accent inline-flex items-center gap-2">
        <Check className="w-4 h-4" /> Your $1 now goes to {title}. Manage this anytime in your account.
      </div>
    );
  }

  return (
    <div>
      <Button size="lg" onClick={back} disabled={busy} className="inline-flex items-center gap-2">
        <Heart className="w-4 h-4" /> {busy ? "Saving…" : me?.authenticated ? "Send my $1 here" : "Join & back this cause"}
      </Button>
      {err && <div className="mt-2 text-sm text-danger">{err}</div>}
      {me?.authenticated && <p className="mt-2 text-xs text-muted">Points your whole dollar at this cause (you can split or change it later).</p>}
    </div>
  );
}
