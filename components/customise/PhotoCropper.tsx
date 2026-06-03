"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { X, ZoomIn, Check, GripVertical } from "lucide-react";
import { ChainPerson } from "@/components/chain/ChainPerson";
import {
  PHOTO_PLACEMENTS, PHOTO_PLACEMENT_LABELS,
  type PhotoPlacement, type PhotoShape, type PersonAppearance,
} from "@/lib/types";

interface Props {
  /** The freshly-chosen file (object URL) to crop. */
  src: string;
  /** The member's current figure, so the placement cards preview their look. */
  appearance: PersonAppearance;
  onCancel: () => void;
  /** Returns the cropped image as a Blob plus where it goes. */
  onSave: (blob: Blob, placement: PhotoPlacement, shape: PhotoShape) => void | Promise<void>;
}

const ASPECT: Record<PhotoPlacement, number> = { head: 1, torso: 1, full: 72 / 146 };
const SHAPE: Record<PhotoPlacement, PhotoShape> = { head: "circle", torso: "square", full: "square" };
const HINT: Record<PhotoPlacement, string> = {
  head: "Your face as a circle, on your designed body.",
  torso: "Your photo across the chest, head & legs stay designed.",
  full: "Your whole photo fills the figure.",
};

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

async function cropToBlob(src: string, area: Area, shape: PhotoShape): Promise<Blob> {
  const img = await loadImage(src);
  // Cap the longest side so uploads stay light.
  const maxSide = 800;
  const scale = Math.min(1, maxSide / Math.max(area.width, area.height));
  const w = Math.max(1, Math.round(area.width * scale));
  const h = Math.max(1, Math.round(area.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  }
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, w, h);
  const type = shape === "circle" ? "image/png" : "image/jpeg";
  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("Crop failed"))), type, 0.9)
  );
}

export function PhotoCropper({ src, appearance, onCancel, onSave }: Props) {
  const [placement, setPlacement] = useState<PhotoPlacement>("head");
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset pan/zoom whenever placement (and therefore aspect) changes.
  useEffect(() => { setCrop({ x: 0, y: 0 }); setZoom(1); }, [placement]);

  const onComplete = useCallback((_: Area, px: Area) => setArea(px), []);

  // ---- drag-to-place ("magnet") ----
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [hot, setHot] = useState<PhotoPlacement | null>(null);

  const hitTest = (x: number, y: number): PhotoPlacement | null => {
    for (const p of PHOTO_PLACEMENTS) {
      const el = cardRefs.current[p];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return p;
    }
    return null;
  };

  const startDrag = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDrag({ x: e.clientX, y: e.clientY });
  };
  const moveDrag = (e: React.PointerEvent) => {
    if (!drag) return;
    setDrag({ x: e.clientX, y: e.clientY });
    setHot(hitTest(e.clientX, e.clientY));
  };
  const endDrag = (e: React.PointerEvent) => {
    if (!drag) return;
    const hit = hitTest(e.clientX, e.clientY);
    if (hit) setPlacement(hit);
    setDrag(null);
    setHot(null);
  };

  const save = async () => {
    if (!area) return;
    setSaving(true);
    try {
      const blob = await cropToBlob(src, area, SHAPE[placement]);
      await onSave(blob, placement, SHAPE[placement]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 backdrop-blur-sm p-4"
      onPointerMove={moveDrag} onPointerUp={endDrag}>
      <div className="bg-white rounded-card shadow-soft w-full max-w-3xl max-h-[92vh] overflow-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="font-semibold">Crop &amp; place your photo</div>
          <button onClick={onCancel} aria-label="Close" className="text-muted hover:text-ink"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_240px] gap-5 p-5">
          {/* Cropper */}
          <div>
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-ink/90">
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={ASPECT[placement]}
                cropShape={SHAPE[placement] === "circle" ? "round" : "rect"}
                showGrid={false}
                restrictPosition
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onComplete}
              />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <ZoomIn className="w-4 h-4 text-muted shrink-0" />
              <input
                type="range" min={1} max={3} step={0.01} value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-accent"
                aria-label="Zoom"
              />
            </div>
            <p className="mt-1 text-xs text-muted">Drag the photo to reposition · slide to zoom.</p>
          </div>

          {/* Placement chooser + drag-magnet */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Where does it go?</div>

            {/* Draggable photo chip — fling it onto a target */}
            <div
              onPointerDown={startDrag}
              className="inline-flex items-center gap-2 select-none cursor-grab active:cursor-grabbing rounded-full border border-border pl-1.5 pr-3 py-1 hover:border-accent"
              style={{ touchAction: "none" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-8 h-8 rounded-full object-cover" />
              <span className="text-xs text-muted inline-flex items-center gap-1"><GripVertical className="w-3 h-3" /> drag onto a spot</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-1 gap-2">
              {PHOTO_PLACEMENTS.map((p) => {
                const on = placement === p;
                const isHot = hot === p;
                return (
                  <button
                    key={p}
                    ref={(el) => { cardRefs.current[p] = el; }}
                    onClick={() => setPlacement(p)}
                    className={`flex items-center gap-3 rounded-xl border p-2 text-left transition-all ${
                      on ? "border-accent bg-emerald-50" : isHot ? "border-accent bg-emerald-50/60 scale-[1.02]" : "border-border hover:border-ink/30"
                    }`}
                  >
                    <span className="shrink-0 grid place-items-center w-11">
                      <ChainPerson
                        {...appearance}
                        photoUrl={src}
                        photoPlacement={p}
                        isActive
                        size="sm"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-sm font-medium ${on ? "text-accent" : "text-ink"}`}>
                        {PHOTO_PLACEMENT_LABELS[p]}
                      </span>
                      <span className="block text-[11px] text-muted leading-tight">{HINT[p]}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <button onClick={onCancel} className="h-10 px-4 rounded-xl border border-border text-sm hover:bg-surface">Cancel</button>
          <button
            onClick={save}
            disabled={saving || !area}
            className="h-10 px-5 rounded-xl bg-accent text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-60"
          >
            <Check className="w-4 h-4" /> {saving ? "Saving…" : "Save photo"}
          </button>
        </div>
      </div>

      {/* Floating ghost while dragging the chip */}
      {drag && (
        <img
          src={src}
          alt=""
          className="pointer-events-none fixed z-[60] w-12 h-12 rounded-full object-cover shadow-soft ring-2 ring-accent"
          style={{ left: drag.x - 24, top: drag.y - 24 }}
        />
      )}
    </div>
  );
}
