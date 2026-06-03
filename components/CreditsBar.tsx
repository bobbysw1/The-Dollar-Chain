"use client";
import { useState } from "react";
import { Coins, LogOut } from "lucide-react";
import type { MeState } from "@/lib/useMe";

export function CreditsBar({ me, onChange }: { me: MeState | null; onChange: () => void }) {
  const [num, setNum] = useState("");

  if (!me) return null;

  if (!me.authenticated) {
    return (
      <div className="bg-white border border-border rounded-card p-4 text-sm">
        <div className="font-medium mb-1">Not signed in</div>
        <p className="text-muted text-xs mb-3">
          Voting and suggestions are member-only. 90% of every donation, after processing fees, funds the projects you vote on.
        </p>
        {process.env.NODE_ENV !== "production" && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const n = parseInt(num.replace(/[^\d]/g, ""), 10);
              if (!n) return;
              await fetch("/api/auth/dev-login", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ memberNumber: n, credits: 1 }),
              });
              onChange();
            }}
            className="flex items-center gap-2"
          >
            <input
              value={num}
              onChange={(e) => setNum(e.target.value)}
              placeholder="Dev: log in as #"
              className="flex-1 h-9 px-3 text-sm rounded-lg border border-border focus:outline-none focus:border-accent"
            />
            <button className="h-9 px-3 text-sm rounded-lg bg-ink text-white">Go</button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-card p-4 flex items-center justify-between">
      <div>
        <div className="text-xs text-muted">Signed in as</div>
        <div className="font-mono tabular text-lg font-semibold">#{me.memberNumber}</div>
      </div>
      <div className="text-right">
        <div className="inline-flex items-center gap-1.5 text-accent font-medium">
          <Coins className="w-4 h-4" />
          <span className="tabular">{me.credits ?? 0}</span>
          <span className="text-xs text-muted font-normal">credit{me.credits === 1 ? "" : "s"}</span>
        </div>
        <button
          onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); onChange(); }}
          className="block ml-auto mt-1 text-[11px] text-muted hover:text-ink inline-flex items-center gap-1"
        >
          <LogOut className="w-3 h-3" /> Sign out
        </button>
      </div>
    </div>
  );
}
