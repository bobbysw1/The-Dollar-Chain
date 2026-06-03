"use client";
import { useRef, useState } from "react";
import { Upload, Shuffle, X, ShieldCheck, Move } from "lucide-react";
import { ChainPerson } from "@/components/chain/ChainPerson";
import { PhotoCropper } from "@/components/customise/PhotoCropper";
import {
  SKIN_TONES, HAIR_COLOURS, SHIRT_COLOURS, HAIR_STYLES, ACCESSORIES, BUILDS,
  ACCESSORY_LABELS, BUILD_LABELS, PHOTO_PLACEMENTS, PHOTO_PLACEMENT_LABELS,
  type PersonAppearance, type HairStyle, type Accessory, type Build,
  type PhotoPlacement, type PhotoShape,
} from "@/lib/types";

interface Props {
  value: PersonAppearance;
  onChange: (patch: Partial<PersonAppearance>) => void;
  number?: number;
}

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

export function AvatarEditor({ value, onChange, number }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const accessories = value.accessories ?? [];
  const build = value.build ?? "regular";
  const placement = value.photoPlacement ?? "full";
  const toggleAccessory = (a: Accessory) => {
    const has = accessories.includes(a);
    onChange({ accessories: has ? accessories.filter((x) => x !== a) : [...accessories, a] });
  };

  // A new file was chosen — open the crop & place modal (don't upload yet).
  const onFileChosen = (file: File) => {
    setUploadErr(null);
    setCropSrc(URL.createObjectURL(file));
  };

  // The cropper handed back a finished image — upload it and record placement.
  const onCropSave = async (blob: Blob, place: PhotoPlacement, shape: PhotoShape) => {
    setUploading(true); setUploadErr(null);
    try {
      const ext = shape === "circle" ? "png" : "jpg";
      const fd = new FormData();
      fd.append("file", new File([blob], `avatar.${ext}`, { type: blob.type }));
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) { setUploadErr(j.error || "Upload failed."); return; }
      onChange({ photoUrl: j.url, photoStatus: "pending", photoPlacement: place, photoShape: shape });
      closeCropper();
    } catch {
      setUploadErr("Upload failed — check your connection.");
    } finally {
      setUploading(false);
    }
  };

  const closeCropper = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const removePhoto = () =>
    onChange({ photoUrl: undefined, photoStatus: undefined, photoPlacement: undefined, photoShape: undefined });

  const randomise = () => onChange({
    skinTone: pick(SKIN_TONES), shirtColour: pick(SHIRT_COLOURS), hairColour: pick(HAIR_COLOURS),
    hairStyle: pick(HAIR_STYLES), build: pick(BUILDS),
    accessories: Math.random() > 0.5 ? [pick(ACCESSORIES)] : [],
    photoUrl: undefined, photoStatus: undefined, photoPlacement: undefined, photoShape: undefined,
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-6 items-start">
      {/* preview */}
      <div className="rounded-card border border-border bg-white p-5 grid place-items-center sm:sticky sm:top-6">
        <ChainPerson
          skinTone={value.skinTone} shirtColour={value.shirtColour} hairColour={value.hairColour}
          hairStyle={value.hairStyle} build={build} accessories={accessories}
          photoUrl={value.photoUrl} photoPlacement={value.photoPlacement} number={number} isActive size="lg"
        />
        <button onClick={randomise} className="mt-3 text-xs text-accent hover:underline inline-flex items-center gap-1">
          <Shuffle className="w-3 h-3" /> Surprise me
        </button>
      </div>

      <div className="space-y-5">
        {/* Photo upload */}
        <Field label="Use a photo (optional)">
          {value.photoUrl ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value.photoUrl} alt="Your upload" className="w-14 h-14 rounded-xl object-cover border border-border" />
                <div className="text-sm">
                  <div className="text-ink font-medium">Photo added · {PHOTO_PLACEMENT_LABELS[placement]}</div>
                  <div className="text-xs text-muted">Pending review before it shows publicly.</div>
                </div>
                <button
                  onClick={removePhoto}
                  className="ml-auto text-muted hover:text-danger"
                  aria-label="Remove photo"
                ><X className="w-4 h-4" /></button>
              </div>
              {/* Quick move between spots without re-cropping */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted inline-flex items-center gap-1"><Move className="w-3 h-3" /> Move:</span>
                {PHOTO_PLACEMENTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => onChange({ photoPlacement: p })}
                    className={`px-2.5 h-7 text-xs rounded-full border transition-colors ${
                      placement === p ? "bg-accent text-white border-accent" : "border-border text-ink hover:border-ink/30"
                    }`}
                  >
                    {PHOTO_PLACEMENT_LABELS[p]}
                  </button>
                ))}
                <button onClick={() => fileRef.current?.click()} className="ml-auto text-xs text-accent hover:underline">
                  Replace
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border hover:border-accent text-sm"
            >
              <Upload className="w-4 h-4" /> {uploading ? "Uploading…" : "Upload a face, shirt or full photo"}
            </button>
          )}
          <input
            ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileChosen(f); e.target.value = ""; }}
          />
          {uploadErr && <div className="text-xs text-danger mt-1">{uploadErr}</div>}
          <div className="mt-2 flex items-start gap-1.5 text-xs text-muted">
            <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent" />
            <span>
              All uploaded images are checked by a human before they go live, to make sure nothing rude
              ends up on the chain. Until it's approved, your designed figure shows instead.
            </span>
          </div>
        </Field>

        <div className="border-t border-border pt-5 space-y-5">
          <Swatches label="Skin tone" options={SKIN_TONES} value={value.skinTone} onPick={(v) => onChange({ skinTone: v })} />
          <Pills label="Build" options={BUILDS} value={build} labels={BUILD_LABELS} onPick={(v) => onChange({ build: v as Build })} />
          <Pills label="Hair style" options={HAIR_STYLES} value={value.hairStyle} onPick={(v) => onChange({ hairStyle: v as HairStyle })} />
          <Swatches label="Hair colour" options={HAIR_COLOURS} value={value.hairColour} onPick={(v) => onChange({ hairColour: v })} />
          <Swatches label="Shirt colour" options={SHIRT_COLOURS} value={value.shirtColour} onPick={(v) => onChange({ shirtColour: v })} />

          <div>
            <div className="text-xs text-muted mb-1.5">Accessories <span className="text-muted/70">(pick any)</span></div>
            <div className="flex flex-wrap gap-2">
              {ACCESSORIES.map((a) => {
                const on = accessories.includes(a);
                return (
                  <button
                    key={a}
                    onClick={() => toggleAccessory(a)}
                    className={`px-3 h-8 text-sm rounded-full border transition-colors ${on ? "bg-accent text-white border-accent" : "border-border text-ink hover:border-ink/30"}`}
                  >
                    {ACCESSORY_LABELS[a]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {cropSrc && (
        <PhotoCropper
          src={cropSrc}
          appearance={value}
          onCancel={closeCropper}
          onSave={onCropSave}
        />
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="text-sm font-medium mb-2">{label}</div>{children}</div>;
}

function Swatches({ label, options, value, onPick }: { label: string; options: string[]; value: string; onPick: (v: string) => void }) {
  return (
    <div>
      <div className="text-xs text-muted mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((c) => (
          <button key={c} onClick={() => onPick(c)} aria-label={c}
            className={`w-8 h-8 rounded-full transition-transform ${value === c ? "ring-2 ring-offset-2 ring-ink scale-110" : "hover:scale-105"}`}
            style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}

function Pills({ label, options, value, onPick, labels }: {
  label: string; options: readonly string[]; value: string; onPick: (v: string) => void; labels?: Record<string, string>;
}) {
  return (
    <div>
      <div className="text-xs text-muted mb-1.5">{label}</div>
      <div className="inline-flex flex-wrap gap-1 p-1 bg-surface rounded-xl border border-border">
        {options.map((o) => (
          <button key={o} onClick={() => onPick(o)}
            className={`px-3 h-8 text-sm rounded-lg capitalize transition-colors ${value === o ? "bg-white text-ink shadow-sm font-medium" : "text-muted hover:text-ink"}`}>
            {labels?.[o] ?? o}
          </button>
        ))}
      </div>
    </div>
  );
}
