import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { ChainPerson } from "@/components/chain/ChainPerson";
import { Badge, Dot } from "@/components/ui/Badge";
import { formatAUD, formatDate } from "@/lib/data";
import { planMetaFor } from "@/lib/types";
import { getMemberByNumber } from "@/lib/members";
import { listActiveCauses } from "@/lib/causes";
import { CauseArt } from "@/components/causes/CauseArt";

interface Params { params: { number: string } }

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: Params): Metadata {
  const n = parseInt(params.number, 10);
  return {
    title: `#${n} — The Dollar Chain`,
    description: `See #${n}'s place in The Dollar Chain.`,
  };
}

export default async function MemberPage({ params }: Params) {
  const n = parseInt(params.number, 10);
  if (!n || n < 1) notFound();
  const rec = await getMemberByNumber(n);

  const causes = rec ? await listActiveCauses() : [];
  const backs = rec && !rec.autoAllocate
    ? rec.allocations
        .map((a) => { const c = causes.find((x) => x.id === a.causeId); return c ? { cause: c, pct: a.pct } : null; })
        .filter((x): x is { cause: typeof causes[number]; pct: number } => !!x)
    : [];

  const member = rec && {
    autoAllocate: rec.autoAllocate,
    number: rec.number,
    displayName: rec.displayName,
    isActive: rec.active,
    skinTone: rec.avatar.skinTone,
    shirtColour: rec.avatar.shirtColour,
    hairColour: rec.avatar.hairColour,
    hairStyle: rec.avatar.hairStyle,
    build: rec.avatar.build ?? "regular",
    accessories: rec.avatar.accessories ?? [],
    photoUrl: rec.avatar.photoStatus === "approved" ? rec.avatar.photoUrl : undefined,
    photoPlacement: rec.avatar.photoStatus === "approved" ? rec.avatar.photoPlacement : undefined,
    joinedAt: rec.joinedAt,
    contributedCents: rec.contributedCents,
    plan: rec.plan,
    city: rec.city,
    projectsHelped: rec.projectsHelped,
  };

  if (!member) {
    return (
      <main className="min-h-screen bg-cream">
        <SiteNav />
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <div className="font-mono tabular text-5xl font-semibold text-muted">#{n}</div>
          <p className="mt-4 text-muted">No-one holds this link yet. Join and it could be yours.</p>
          <Link href="/join" className="mt-6 inline-block text-accent hover:underline">
            Claim it →
          </Link>
        </div>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <SiteNav />
      <div className="max-w-lg mx-auto px-6 py-16">
        <div
          className={`relative flex flex-col items-center p-10 rounded-card border border-border ${
            member.isActive ? "bg-emerald-50/30" : "bg-surface"
          }`}
        >
          <ChainPerson
            number={member.number}
            skinTone={member.skinTone}
            shirtColour={member.shirtColour}
            hairColour={member.hairColour}
            hairStyle={member.hairStyle}
            build={member.build}
            accessories={member.accessories}
            photoUrl={member.photoUrl}
            photoPlacement={member.photoPlacement}
            size="lg"
            isActive={member.isActive}
          />
          <div className="mt-6 font-mono tabular text-5xl font-semibold">#{member.number}</div>
          {member.displayName && (
            <div className="mt-1 text-lg">{member.displayName}</div>
          )}
          <Badge tone={member.isActive ? "success" : "accent"} className="mt-3">
            <Dot color={member.isActive ? "#16A34A" : "#0E9F6E"} />
            {member.isActive ? "Active link" : "The latest link"}
          </Badge>
          {!member.isActive && (
            <p className="mt-3 text-sm text-muted text-center max-w-xs">
              #{member.number} has paused their $1 — so right now they're the latest link in the chain.
              Their number is held for them. The moment they give again, the chain grows on from here.
            </p>
          )}
        </div>

        <dl className="mt-8 divide-y divide-border border border-border rounded-card bg-white">
          <Row label="Member since" value={formatDate(member.joinedAt)} />
          <Row label="Contributed" value={formatAUD(member.contributedCents)} />
          <Row label="Plan" value={planMetaFor(member.plan).label} />
          {member.city && <Row label="From" value={member.city} />}
        </dl>

        {/* What #N backs */}
        <div className="mt-8">
          <div className="text-sm text-muted mb-3">#{member.number} backs</div>
          {member.autoAllocate ? (
            <div className="rounded-card border border-border bg-white p-5 flex items-center gap-4">
              <span className="w-12 h-12 rounded-xl bg-emerald-50 text-accent grid place-items-center text-2xl shrink-0">⛓</span>
              <div>
                <div className="font-medium">Wherever it&apos;s needed most</div>
                <div className="text-sm text-muted">Their dollar joins the pot and follows the chain&apos;s weekly vote.</div>
              </div>
            </div>
          ) : backs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {backs.map(({ cause, pct }) => (
                <Link key={cause.id} href={`/causes/${cause.id}`}
                  className="group rounded-card border border-border bg-white overflow-hidden hover:border-ink/30 transition-colors">
                  <div className="aspect-[16/10] overflow-hidden border-b border-border">
                    {cause.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cause.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <CauseArt category={cause.category} className="w-full h-full" />
                    )}
                  </div>
                  <div className="p-3 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium leading-snug group-hover:text-accent transition-colors">{cause.title}</span>
                    <span className="text-xs font-mono tabular text-muted shrink-0">{pct}%</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Not set yet.</p>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link href="/chain" className="text-accent hover:underline text-sm">
            ← Back to the chain
          </Link>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium tabular">{value}</dd>
    </div>
  );
}
