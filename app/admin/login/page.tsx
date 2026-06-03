"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-cream" />}>
      <AdminLogin />
    </Suspense>
  );
}

function AdminLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const notConfigured = params.get("error") === "not_configured";
  const from = params.get("from") || "/admin";

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const r = await fetch("/api/admin/login", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) { setError(j.error || "Login failed."); return; }
    router.push(from);
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-cream">
      <SiteNav />
      <div className="max-w-sm mx-auto px-6 py-24">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-accent grid place-items-center mb-4">
          <Lock className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin sign-in</h1>
        <p className="text-muted text-sm mt-2">Internal dashboard. Members don't need this.</p>

        {notConfigured && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-100 text-sm text-yellow-800">
            No admin password is set. Add <code className="font-mono">ADMIN_PASSWORD</code> to your environment.
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full h-11 px-3 rounded-xl border border-border focus:outline-none focus:border-accent"
          />
          {error && <div className="text-sm text-danger">{error}</div>}
          <Button type="submit" className="w-full" disabled={busy || !password}>
            {busy ? "Checking…" : "Sign in"}
          </Button>
        </form>
      </div>
    </main>
  );
}
