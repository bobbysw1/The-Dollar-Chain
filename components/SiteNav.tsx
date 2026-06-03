import Link from "next/link";
import { Logo } from "./Logo";

export function SiteNav() {
  return (
    <nav className="sticky top-0 z-30 w-full border-b border-border/70 bg-cream/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" aria-label="The Dollar Chain — home" className="flex items-center shrink-0">
          <Logo size={76} />
        </Link>
        <div className="flex items-center gap-0.5 text-sm text-muted">
          <Link href="/local" className="px-3 py-1.5 rounded-full hover:text-ink hover:bg-surface transition-colors">Suburbs</Link>
          <Link href="/chain" className="px-3 py-1.5 rounded-full hover:text-ink hover:bg-surface transition-colors">Chain</Link>
          <Link href="/projects" className="px-3 py-1.5 rounded-full hover:text-ink hover:bg-surface transition-colors">Impact</Link>
          <Link href="/transparency" className="px-3 py-1.5 rounded-full hover:text-ink hover:bg-surface transition-colors">Transparency</Link>
          <Link href="/faq" className="px-3 py-1.5 rounded-full hover:text-ink hover:bg-surface transition-colors">FAQ</Link>
          <Link href="/login" className="px-3 py-1.5 rounded-full hover:text-ink hover:bg-surface transition-colors">Log in</Link>
          <Link href="/join" className="ml-2 inline-flex h-9 items-center rounded-full bg-accent px-5 text-white text-sm font-semibold shadow-soft hover:bg-emerald-700 hover:-translate-y-px transition-all">Join</Link>
        </div>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-20 mt-24 border-t border-border bg-surface">
      <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-muted flex flex-wrap items-center justify-between gap-4">
        <span>© The Dollar Chain — 90% of every donation (after processing fees) funds local projects, 10% covers running costs. Made on the southern Gold Coast.</span>
        <div className="flex items-center gap-4">
          <Link href="/local" className="hover:text-ink">Suburbs</Link>
          <Link href="/chain" className="hover:text-ink">Chain</Link>
          <Link href="/projects" className="hover:text-ink">Impact</Link>
          <Link href="/transparency" className="hover:text-ink">Transparency</Link>
          <Link href="/faq" className="hover:text-ink">FAQ</Link>
          <Link href="/join" className="hover:text-ink">Join</Link>
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/terms" className="hover:text-ink">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
