"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { SnakeChain } from "@/components/chain/SnakeChain";
import { Button } from "@/components/ui/Button";
import { chainOrdered } from "@/lib/data";

interface PublicMember {
  number: number; isActive: boolean;
  skinTone: string; shirtColour: string; hairColour: string;
  hairStyle: string; accessory: string; displayName?: string;
}

export default function ChainBrowserPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [all, setAll] = useState<PublicMember[]>([]);
  const [stats, setStats] = useState<{ total: number; active: number }>({ total: 0, active: 0 });

  useEffect(() => {
    fetch("/api/chain", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => { setAll(j.members ?? []); setStats({ total: j.stats?.total ?? 0, active: j.stats?.active ?? 0 }); });
  }, []);

  const members = useMemo(
    () => chainOrdered(all.filter((m) => !activeOnly || m.isActive)) as any,
    [all, activeOnly]
  );

  const submitJump = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(q.replace(/[^\d]/g, ""), 10);
    if (n) router.push(`/chain/${n}`);
  };

  return (
    <main className="min-h-screen bg-cream relative">
      <SiteNav />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">The chain</h1>
            <p className="text-muted mt-2 tabular">
              {stats.total.toLocaleString()} {stats.total === 1 ? "link" : "links"} · {stats.active.toLocaleString()} active
            </p>
            <p className="text-muted text-sm mt-1 max-w-md">
              #1 leads. Active links hold their place; anyone who's paused drops to the tail —
              they become the latest link, ready to grow it again.
            </p>
          </div>
          <form onSubmit={submitJump} className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Jump to #..."
              className="h-10 w-44 px-3 rounded-xl border border-border focus:outline-none focus:border-accent"
            />
            <Button type="submit" variant="secondary">Go</Button>
            <label className="ml-3 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} className="accent-accent" />
              Active only
            </label>
          </form>
        </div>

        {members.length <= 1 && (
          <div className="mt-8 rounded-card border border-dashed border-border bg-white/60 p-8 text-center">
            <h3 className="text-lg font-semibold">The chain is just getting started.</h3>
            <p className="text-muted mt-1">Right now it's one link. Join and you'll be #{stats.total + 1}.</p>
            <a href="/join" className="mt-4 inline-block"><Button>Join the chain</Button></a>
          </div>
        )}
      </div>

      <div className="relative h-[1000px]">
        <SnakeChain
          members={members}
          position="absolute"
          bgOpacity={1}
          foreground
          interactive
          onMemberClick={(m) => router.push(`/chain/${m.number}`)}
        />
      </div>

      <SiteFooter />
    </main>
  );
}
