"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const r = await fetch("/api/auth/login", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) { setError(j.error || "Login failed."); return; }
    router.push("/account");
    router.refresh();
  };

  return (
    <main className="relative min-h-screen bg-cream">
      <div aria-hidden className="flow-bg pointer-events-none absolute inset-x-0 top-0 h-[320px] z-0" />
      <SiteNav />
      <div className="relative z-10 max-w-sm mx-auto px-6 py-20">
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-accent grid place-items-center mb-4">
          <LogIn className="w-5 h-5" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-muted mt-2">Log in to manage your subscription, vote, and edit your figure.</p>

        <form onSubmit={submit} className="mt-8 space-y-3">
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" autoComplete="email" autoFocus
            className="w-full h-12 px-4 rounded-xl border border-border focus:outline-none focus:border-accent"
          />
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password" autoComplete="current-password"
            className="w-full h-12 px-4 rounded-xl border border-border focus:outline-none focus:border-accent"
          />
          {error && <div className="text-sm text-danger">{error}</div>}
          <Button type="submit" size="lg" className="w-full" disabled={busy || !email || !password}>
            {busy ? "Logging in…" : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted">
          Not in the chain yet?{" "}
          <Link href="/join" className="text-accent hover:underline">Join with $1 →</Link>
        </p>
      </div>
      <SiteFooter />
    </main>
  );
}
