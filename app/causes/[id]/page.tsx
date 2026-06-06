import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Users } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { Dot, Badge } from "@/components/ui/Badge";
import { BackCauseButton } from "@/components/causes/BackCauseButton";
import { CauseArt } from "@/components/causes/CauseArt";
import { getCause } from "@/lib/causes";
import { getSuburb } from "@/lib/suburbs";
import { formatAUD } from "@/lib/data";
import { CATEGORY_COLOURS } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Params { params: { id: string } }

export default async function CausePage({ params }: Params) {
  const cause = await getCause(params.id);
  if (!cause) notFound();

  const images = cause.images ?? [];
  const raised = cause.raisedCents ?? 0;
  const target = cause.targetCents ?? 0;
  const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  const suburbName = cause.suburb ? getSuburb(cause.suburb)?.name : null;

  return (
    <main className="min-h-screen bg-cream">
      <SiteNav />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-6">
          <ArrowLeft className="w-4 h-4" /> All causes
        </Link>

        <div className="flex items-center gap-2 text-xs text-muted mb-3">
          <Dot color={CATEGORY_COLOURS[cause.category]} />
          <span>{cause.category}</span>
          {suburbName && <><span>·</span><span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{suburbName}</span></>}
          {cause.source === "member" && <Badge tone="muted" className="!text-[10px] !py-0">Member-submitted</Badge>}
        </div>

        <h1 className="text-4xl font-semibold tracking-tight">{cause.title}</h1>

        {/* gallery (uploaded photos) or a matching illustration */}
        {images.length > 0 ? (
          <div className={`mt-6 grid gap-3 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {images.map((url, i) => (
              <div key={url} className={`overflow-hidden rounded-card border border-border bg-surface ${images.length > 1 && i === 0 ? "col-span-2" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`${cause.title} photo ${i + 1}`} className="w-full h-full object-cover max-h-[420px]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-card overflow-hidden border border-border">
            <CauseArt category={cause.category} className="w-full h-56 sm:h-72" />
          </div>
        )}

        {/* progress */}
        {target > 0 && (
          <div className="mt-8 p-5 rounded-card border border-border bg-white">
            <div className="flex items-end justify-between mb-2">
              <div className="text-2xl font-semibold tabular">{formatAUD(raised)}</div>
              <div className="text-sm text-muted tabular">of {formatAUD(target)} goal</div>
            </div>
            <div className="h-2.5 rounded-full bg-surface overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 text-xs text-muted">{pct}% funded{cause.votes ? ` · ${cause.votes} upvotes` : ""}</div>
          </div>
        )}

        {/* story */}
        <div className="mt-8 prose-sm">
          <p className="text-lg text-ink/90 leading-relaxed whitespace-pre-line">{cause.description}</p>
        </div>

        {cause.suggestedBy && (
          <p className="mt-6 text-sm text-muted inline-flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Suggested by member #{cause.suggestedBy}
          </p>
        )}

        {/* CTA */}
        <div className="mt-10 border-t border-border pt-8">
          <h2 className="text-xl font-semibold mb-1">Back this cause</h2>
          <p className="text-muted text-sm mb-4">Dedicate your weekly $1 here — every dollar in the chain is one real vote for this.</p>
          <BackCauseButton causeId={cause.id} title={cause.title} />
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
