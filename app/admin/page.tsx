"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, FolderKanban, LogOut, Image as ImageIcon, Check, X, HeartHandshake } from "lucide-react";
import { formatAUD } from "@/lib/data";
import { PHOTO_PLACEMENT_LABELS, type PhotoPlacement } from "@/lib/types";

type Tab = "overview" | "members" | "photos" | "causes" | "projects" | "payments";

interface PendingPhoto { number: number; displayName?: string; photoUrl: string; photoPlacement?: PhotoPlacement; joinedAt: string }
interface PendingCause { id: string; title: string; description: string; category: string; suburb?: string; images?: string[]; targetCents?: number; suggestedBy: number; createdAt: string }

interface Stats { totalMembers: number; activeMembers: number; raisedCents: number; balanceCents: number; deployedCents: number; peopleHelped: number; suburbsBacked: number }
interface Member { number: number; displayName?: string; dedicatedSuburb?: string; isActive: boolean; plan: string; contributedCents: number; joinedAt: string }

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const [pendingCauses, setPendingCauses] = useState<PendingCause[]>([]);
  const router = useRouter();

  const loadPending = () =>
    fetch("/api/admin/photos", { cache: "no-store" }).then((r) => r.json()).then((j) => setPending(j.pending ?? [])).catch(() => {});
  const loadCauses = () =>
    fetch("/api/admin/causes", { cache: "no-store" }).then((r) => r.json()).then((j) => setPendingCauses(j.pending ?? [])).catch(() => {});

  useEffect(() => {
    fetch("/api/stats", { cache: "no-store" }).then((r) => r.json()).then(setStats).catch(() => {});
    fetch("/api/chain", { cache: "no-store" }).then((r) => r.json()).then((j) => setMembers(j.members ?? [])).catch(() => {});
    loadPending();
    loadCauses();
  }, []);

  const signOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-surface">
      <div className="flex">
        <aside className="w-56 min-h-screen border-r border-border bg-white px-3 py-6 flex flex-col">
          <Link href="/" className="block px-3 mb-6 font-semibold">⛓ Admin</Link>
          <nav className="space-y-1 text-sm">
            <NavItem icon={<LayoutDashboard className="w-4 h-4" />} active={tab === "overview"} onClick={() => setTab("overview")}>Overview</NavItem>
            <NavItem icon={<Users className="w-4 h-4" />} active={tab === "members"} onClick={() => setTab("members")}>Members</NavItem>
            <NavItem icon={<ImageIcon className="w-4 h-4" />} active={tab === "photos"} onClick={() => setTab("photos")} badge={pending.length || undefined}>Photos</NavItem>
            <NavItem icon={<HeartHandshake className="w-4 h-4" />} active={tab === "causes"} onClick={() => setTab("causes")} badge={pendingCauses.length || undefined}>Causes</NavItem>
            <NavItem icon={<FolderKanban className="w-4 h-4" />} active={tab === "projects"} onClick={() => setTab("projects")}>Projects</NavItem>
            <NavItem icon={<CreditCard className="w-4 h-4" />} active={tab === "payments"} onClick={() => setTab("payments")}>Payments</NavItem>
          </nav>
          <button onClick={signOut} className="mt-auto flex items-center gap-2 px-3 py-2 rounded-lg text-left text-muted hover:bg-surface hover:text-ink text-sm">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </aside>

        <section className="flex-1 p-8">
          {tab === "overview" && <Overview stats={stats} members={members} />}
          {tab === "members" && <MembersTab members={members} />}
          {tab === "photos" && <PhotosTab pending={pending} reload={loadPending} />}
          {tab === "causes" && <CausesTab pending={pendingCauses} reload={loadCauses} />}
          {tab === "projects" && <ProjectsTab />}
          {tab === "payments" && <PaymentsTab />}
        </section>
      </div>
    </main>
  );
}

function NavItem({ icon, children, active, onClick, badge }: { icon: React.ReactNode; children: React.ReactNode; active?: boolean; onClick: () => void; badge?: number }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left ${active ? "bg-surface text-ink font-medium" : "text-muted hover:bg-surface hover:text-ink"}`}>
      {icon}<span className="flex-1">{children}</span>
      {badge ? <span className="inline-grid place-items-center min-w-5 h-5 px-1.5 rounded-full bg-accent text-white text-[11px] font-semibold tabular">{badge}</span> : null}
    </button>
  );
}

function PhotosTab({ pending, reload }: { pending: PendingPhoto[]; reload: () => Promise<void> | void }) {
  const [busy, setBusy] = useState<number | null>(null);

  const act = async (number: number, action: "approve" | "reject") => {
    setBusy(number);
    try {
      await fetch("/api/admin/photos", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ number, action }),
      });
      await reload();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Photos to review</h1>
      <p className="text-muted text-sm mb-6">Uploaded photos stay hidden until you approve them. Approve to publish on the chain, or reject to remove.</p>
      {pending.length === 0 ? (
        <div className="bg-white border border-border rounded-card p-10 text-center text-muted">
          Nothing waiting — you&apos;re all caught up. 🎉
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pending.map((p) => (
            <div key={p.number} className="bg-white border border-border rounded-card overflow-hidden">
              <div className="aspect-square bg-surface grid place-items-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.photoUrl} alt={`Pending photo for #${p.number}`} className="w-full h-full object-contain" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono tabular text-sm">#{p.number}</div>
                  <div className="text-xs text-muted">{p.photoPlacement ? PHOTO_PLACEMENT_LABELS[p.photoPlacement] : "Full body"}</div>
                </div>
                {p.displayName && <div className="text-sm mt-0.5 truncate">{p.displayName}</div>}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => act(p.number, "approve")} disabled={busy === p.number}
                    className="flex-1 h-9 rounded-lg bg-accent text-white text-sm font-medium inline-flex items-center justify-center gap-1.5 hover:bg-emerald-700 disabled:opacity-60">
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => act(p.number, "reject")} disabled={busy === p.number}
                    className="flex-1 h-9 rounded-lg border border-border text-sm text-ink inline-flex items-center justify-center gap-1.5 hover:border-danger hover:text-danger disabled:opacity-60">
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-border rounded-card p-5">
      <div className="text-xs text-muted uppercase tracking-wide">{label}</div>
      <div className="mt-2 text-2xl font-semibold tabular">{value}</div>
    </div>
  );
}

function Overview({ stats, members }: { stats: Stats | null; members: Member[] }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total members" value={stats ? stats.totalMembers.toLocaleString() : "—"} />
        <StatCard label="Active members" value={stats ? stats.activeMembers.toLocaleString() : "—"} />
        <StatCard label="Raised so far" value={stats ? formatAUD(stats.raisedCents) : "—"} />
        <StatCard label="Balance to deploy" value={stats ? formatAUD(stats.balanceCents) : "—"} />
      </div>
      <div className="bg-white border border-border rounded-card p-6">
        <div className="font-medium mb-2">Recent activity</div>
        <ul className="text-sm space-y-2 text-muted">
          {members.slice(-5).reverse().map((m) => (
            <li key={m.number}>Member #{m.number} {m.displayName ? `(${m.displayName}) ` : ""}— {m.dedicatedSuburb ?? "—"}</li>
          ))}
          {members.length === 0 && <li>No members yet.</li>}
        </ul>
      </div>
    </div>
  );
}

function MembersTab({ members }: { members: Member[] }) {
  const [q, setQ] = useState("");
  const filtered = members.filter((m) =>
    !q || String(m.number).includes(q) || (m.displayName || "").toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Members</h1>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by number or name"
        className="mb-4 h-10 w-72 px-3 rounded-xl border border-border focus:outline-none focus:border-accent" />
      <div className="bg-white border border-border rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted text-left">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Suburb</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Contributed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((m) => (
              <tr key={m.number} className="hover:bg-surface/50">
                <td className="px-4 py-3 font-mono tabular">#{m.number}</td>
                <td className="px-4 py-3">{m.displayName || <span className="text-muted">—</span>}</td>
                <td className="px-4 py-3">{m.dedicatedSuburb || "—"}</td>
                <td className="px-4 py-3">{m.plan}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs ${m.isActive ? "text-success" : "text-muted"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${m.isActive ? "bg-success" : "bg-muted"}`} />
                    {m.isActive ? "Active" : "Latest link"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular">{formatAUD(m.contributedCents)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No members yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CausesTab({ pending, reload }: { pending: PendingCause[]; reload: () => Promise<void> | void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const act = async (id: string, action: "approve" | "reject") => {
    setBusy(id);
    try {
      await fetch("/api/admin/causes", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      await reload();
    } finally { setBusy(null); }
  };
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Causes to review</h1>
      <p className="text-muted text-sm mb-6">Member-submitted causes stay hidden until you approve them. Approved causes get a public tile and fundraising page.</p>
      {pending.length === 0 ? (
        <div className="bg-white border border-border rounded-card p-10 text-center text-muted">Nothing waiting — all caught up. 🎉</div>
      ) : (
        <div className="space-y-4">
          {pending.map((c) => (
            <div key={c.id} className="bg-white border border-border rounded-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs text-muted mb-1">{c.category}{c.suburb ? ` · ${c.suburb}` : ""} · by #{c.suggestedBy}{c.targetCents ? ` · target ${formatAUD(c.targetCents)}` : ""}</div>
                  <h3 className="font-semibold text-lg">{c.title}</h3>
                  <p className="text-sm text-muted mt-1 whitespace-pre-line">{c.description}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => act(c.id, "approve")} disabled={busy === c.id}
                    className="h-9 px-3 rounded-lg bg-accent text-white text-sm font-medium inline-flex items-center justify-center gap-1.5 hover:bg-emerald-700 disabled:opacity-60"><Check className="w-4 h-4" /> Approve</button>
                  <button onClick={() => act(c.id, "reject")} disabled={busy === c.id}
                    className="h-9 px-3 rounded-lg border border-border text-sm text-ink inline-flex items-center justify-center gap-1.5 hover:border-danger hover:text-danger disabled:opacity-60"><X className="w-4 h-4" /> Reject</button>
                </div>
              </div>
              {c.images && c.images.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {c.images.map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={url} src={url} alt="" className="w-24 h-24 rounded-lg object-cover border border-border" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectsTab() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Projects</h1>
      <div className="bg-white border border-border rounded-card p-10 text-center text-muted">
        No projects funded yet. Once the chain funds its first cause it'll be recorded here and shown
        on the public Impact page.
      </div>
    </div>
  );
}

interface Payment { id: string; amount: number; fee: number | null; net: number | null; currency: string; status: string; refunded: boolean; created: number; email: string | null; method: string | null }

function PaymentsTab() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totals, setTotals] = useState<{ gross: number; fee: number; net: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/payments", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => { setPayments(j.payments ?? []); setTotals(j.totals ?? null); if (j.error) setErr(j.error); })
      .catch(() => setErr("Couldn't load payments."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Payments</h1>
      <p className="text-muted text-sm mb-6">Live from Stripe — every charge, the fee Stripe took, and what actually landed.</p>

      {totals && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="Collected (gross)" value={formatAUD(totals.gross)} />
          <StatCard label="Stripe fees" value={`−${formatAUD(totals.fee)}`} />
          <StatCard label="Net in the fund" value={formatAUD(totals.net)} />
        </div>
      )}

      <div className="bg-white border border-border rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
              <th className="px-4 py-3 font-medium text-right">Fee</th>
              <th className="px-4 py-3 font-medium text-right">Net</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-surface/50">
                <td className="px-4 py-3 tabular whitespace-nowrap">{new Date(p.created * 1000).toLocaleDateString()}</td>
                <td className="px-4 py-3">{p.email || <span className="text-muted">—</span>}</td>
                <td className="px-4 py-3 capitalize">{p.method?.replace("_", " ") || "—"}</td>
                <td className="px-4 py-3 text-right tabular">{formatAUD(p.amount)}</td>
                <td className="px-4 py-3 text-right tabular text-muted">{p.fee != null ? `−${formatAUD(p.fee)}` : "—"}</td>
                <td className="px-4 py-3 text-right tabular font-medium">{p.net != null ? formatAUD(p.net) : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs ${p.refunded ? "text-muted" : p.status === "succeeded" ? "text-success" : "text-danger"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${p.refunded ? "bg-muted" : p.status === "succeeded" ? "bg-success" : "bg-danger"}`} />
                    {p.refunded ? "Refunded" : p.status}
                  </span>
                </td>
              </tr>
            ))}
            {!loading && payments.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">{err || "No payments yet. Real charges will appear here."}</td></tr>
            )}
            {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">Loading…</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
