import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";

/* Coast-wide Emergency Fund promo — shown at the top of the suburbs pages. */
export function EmergencyFundBanner({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/emergency"
      className={`group block rounded-card border border-rose-200 bg-gradient-to-r from-rose-50 to-amber-50 p-5 hover:border-rose-300 transition-colors ${className}`}
    >
      <div className="flex items-start gap-4">
        <span className="shrink-0 w-11 h-11 rounded-xl bg-rose-100 text-rose-600 grid place-items-center">
          <ShieldAlert className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-ink">The Emergency Fund</h3>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-rose-600 bg-rose-100 rounded-full px-2 py-0.5">Coast-wide</span>
          </div>
          <p className="text-sm text-muted mt-1">
            <strong className="text-ink">10% of every donation</strong> (after costs) is set aside, ready to help locals
            in genuine crisis — escaping family violence, single parents on the edge, disaster &amp; homelessness relief.
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-sm text-rose-600 font-medium group-hover:gap-1.5 transition-all">
            How it works <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
