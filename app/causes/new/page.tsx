"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, X, ShieldCheck, ArrowLeft, Target, MapPin, LocateFixed } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { Button } from "@/components/ui/Button";
import { CauseMap } from "@/components/causes/CauseMap";
import { useMe } from "@/lib/useMe";
import { SUBURBS } from "@/lib/suburbs";
import { ALL_CATEGORIES, type ProjectCategory } from "@/lib/types";

export default function NewCausePage() {
  const { me } = useMe();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProjectCategory>("Shelter");
  const [suburb, setSuburb] = useState("");
  const [target, setTarget] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [locationLabel, setLocationLabel] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoErr, setGeoErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const addImage = async (file: File) => {
    if (images.length >= 3) return;
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) { setError(j.error || "Image upload failed."); return; }
      setImages((prev) => [...prev, j.url].slice(0, 3));
    } catch {
      setError("Image upload failed — check your connection.");
    } finally {
      setUploading(false);
    }
  };

  const geocode = async () => {
    if (!locationLabel.trim()) { setGeoErr("Type a street, landmark or address first."); return; }
    setGeoBusy(true); setGeoErr(null);
    try {
      const q = encodeURIComponent(`${locationLabel}, Gold Coast QLD Australia`);
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`, {
        headers: { "Accept": "application/json" },
      });
      const j = await r.json();
      if (j[0]) { setLat(parseFloat(j[0].lat)); setLng(parseFloat(j[0].lon)); }
      else setGeoErr("Couldn't find that spot — try a nearby street/landmark, or use your current location.");
    } catch {
      setGeoErr("Map lookup failed — check your connection.");
    } finally {
      setGeoBusy(false);
    }
  };

  const useMyLocation = () => {
    setGeoErr(null);
    if (!navigator.geolocation) { setGeoErr("Your browser can't share location."); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); },
      () => setGeoErr("Couldn't get your location — allow location access, or type an address."),
    );
  };

  const submit = async () => {
    setBusy(true); setError(null);
    try {
      const targetCents = target ? Math.round(parseFloat(target) * 100) : undefined;
      const r = await fetch("/api/suggestions", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title, description, category, suburb: suburb || undefined, images, targetCents,
          lat: lat ?? undefined, lng: lng ?? undefined, locationLabel: locationLabel || undefined,
        }),
      });
      const j = await r.json();
      if (!r.ok) { setError(j.error === "not_authenticated" ? "Please sign in first." : j.error || "Couldn't submit."); return; }
      setDone(true);
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <main className="min-h-screen bg-cream">
        <SiteNav />
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 text-accent grid place-items-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Thanks — it&apos;s submitted</h1>
          <p className="text-muted mt-3">
            Your cause is awaiting a quick human review before it goes live on the chain. Once approved
            it&apos;ll appear as a tile with its own fundraising page that members can back.
          </p>
          <div className="mt-6 flex gap-2 justify-center">
            <Link href="/projects"><Button variant="secondary">Back to Impact</Button></Link>
            <Button onClick={() => { setDone(false); setTitle(""); setDescription(""); setImages([]); setTarget(""); }}>Add another</Button>
          </div>
        </div>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <SiteNav />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Impact
        </Link>
        <h1 className="text-4xl font-semibold tracking-tight">Add a cause</h1>
        <p className="text-muted mt-3">
          Tell us about something local that needs help. Be specific — the chain backs real, concrete things.
          A human reviews every cause before it goes live.
        </p>

        {!me?.authenticated && (
          <div className="mt-6 p-4 rounded-xl bg-yellow-50 border border-yellow-100 text-sm text-yellow-800">
            You&apos;ll need to <Link href="/login" className="underline font-medium">sign in</Link> to submit a cause.
          </div>
        )}

        <div className="mt-8 space-y-5">
          <Field label="Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80}
              placeholder="e.g. Get the Currumbin under-12s to the state comp"
              className="w-full h-12 px-4 rounded-xl border border-border bg-white focus:outline-none focus:border-accent" />
          </Field>

          <Field label="The story">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} maxLength={1200}
              placeholder="Who is this for, where, what's needed and why it matters. The more honest and specific, the better."
              className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:border-accent resize-none" />
            <div className="text-xs text-muted mt-1 tabular">{description.length}/1200</div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category">
              <select value={category} onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full h-12 px-4 rounded-xl border border-border bg-white focus:outline-none focus:border-accent">
                {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Suburb (optional)">
              <select value={suburb} onChange={(e) => setSuburb(e.target.value)}
                className={`w-full h-12 px-4 rounded-xl border border-border bg-white focus:outline-none focus:border-accent ${suburb ? "text-ink" : "text-muted"}`}>
                <option value="">Anywhere on the southern GC</option>
                {SUBURBS.map((sb) => <option key={sb.slug} value={sb.slug}>{sb.name}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Funding target (optional)">
            <div className="relative max-w-[200px]">
              <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <span className="absolute left-9 top-1/2 -translate-y-1/2 text-muted">$</span>
              <input value={target} onChange={(e) => setTarget(e.target.value.replace(/[^0-9.]/g, ""))}
                inputMode="decimal" placeholder="2000"
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-white focus:outline-none focus:border-accent tabular" />
            </div>
          </Field>

          <Field label="Location (optional)">
            <div className="flex gap-2">
              <input
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                placeholder="e.g. Bergamont St & Agave St, Elanora"
                className="flex-1 h-12 px-4 rounded-xl border border-border bg-white focus:outline-none focus:border-accent"
              />
              <button type="button" onClick={geocode} disabled={geoBusy}
                className="h-12 px-4 rounded-xl border border-border hover:border-accent text-sm inline-flex items-center gap-1.5 shrink-0">
                <MapPin className="w-4 h-4" /> {geoBusy ? "Finding…" : "Find on map"}
              </button>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs">
              <button type="button" onClick={useMyLocation} className="text-accent hover:underline inline-flex items-center gap-1">
                <LocateFixed className="w-3.5 h-3.5" /> Use my current location
              </button>
              {lat != null && lng != null && (
                <button type="button" onClick={() => { setLat(null); setLng(null); }} className="text-muted hover:text-danger">Clear pin</button>
              )}
            </div>
            {geoErr && <div className="text-xs text-danger mt-1">{geoErr}</div>}
            {lat != null && lng != null && <CauseMap lat={lat} lng={lng} label={locationLabel} className="mt-3" />}
          </Field>

          <Field label="Photos (up to 3)">
            <div className="flex flex-wrap gap-3">
              {images.map((url, i) => (
                <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Cause photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button onClick={() => setImages((p) => p.filter((u) => u !== url))}
                    className="absolute top-1 right-1 w-6 h-6 grid place-items-center rounded-full bg-ink/70 text-white hover:bg-ink"
                    aria-label="Remove photo"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              {images.length < 3 && (
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="w-24 h-24 rounded-xl border border-dashed border-border hover:border-accent grid place-items-center text-muted text-xs">
                  {uploading ? "Uploading…" : <span className="flex flex-col items-center gap-1"><Upload className="w-4 h-4" /> Add</span>}
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) addImage(f); e.target.value = ""; }} />
            <div className="mt-2 flex items-start gap-1.5 text-xs text-muted">
              <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent" />
              <span>Images are checked by a human before the cause goes live.</span>
            </div>
          </Field>

          {error && <div className="text-sm text-danger">{error}</div>}

          <Button size="lg" className="w-full" onClick={submit}
            disabled={busy || uploading || !title.trim() || !description.trim() || !me?.authenticated}>
            {busy ? "Submitting…" : "Submit cause for review"}
          </Button>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="text-sm font-medium mb-2">{label}</div>{children}</div>;
}
