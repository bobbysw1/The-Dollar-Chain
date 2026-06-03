"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChainPerson } from "./ChainPerson";
import type { HairStyle, Accessory, Build } from "@/lib/types";

/** Minimal shape the chain needs to draw a figure. */
export interface ChainFigure {
  number: number;
  isActive: boolean;
  skinTone: string;
  shirtColour: string;
  hairColour: string;
  hairStyle: HairStyle;
  build?: Build;
  accessories?: Accessory[];
  photoUrl?: string;
}

interface Props {
  members: ChainFigure[];
  /** spacing between figures in px along the path */
  spacing?: number;
  /** opacity of figures sitting behind foreground cards */
  bgOpacity?: number;
  position?: "fixed" | "absolute";
  onMemberClick?: (m: ChainFigure) => void;
  foreground?: boolean;
  interactive?: boolean;
  /** px the snake's head advances per second */
  speed?: number;
  /** random seed (so the path differs per page) */
  seed?: number;
}

/* ----- path generation ----- */

function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** Build a closed loop of waypoints that traces the full document perimeter
 *  with random wobble + occasional interior dips, then close back to start. */
function buildLoopWaypoints(width: number, height: number, seed: number): [number, number][] {
  const rng = makeRng(seed);
  const margin = 70;
  const wobble = (range: number) => (rng() - 0.5) * range;
  const points: [number, number][] = [];

  const topSteps = Math.max(4, Math.round(width / 220));
  const sideSteps = Math.max(4, Math.round(height / 360));

  // Top edge L → R
  for (let i = 0; i <= topSteps; i++) {
    const x = margin + (width - 2 * margin) * (i / topSteps);
    const y = margin + Math.abs(wobble(140));
    points.push([x, y]);
  }
  // Right edge top → bottom
  for (let i = 1; i <= sideSteps; i++) {
    const y = margin + (height - 2 * margin) * (i / sideSteps);
    const x = width - margin - Math.abs(wobble(140));
    points.push([x, y]);
  }
  // Bottom edge R → L
  for (let i = 1; i <= topSteps; i++) {
    const x = width - margin - (width - 2 * margin) * (i / topSteps);
    const y = height - margin - Math.abs(wobble(140));
    points.push([x, y]);
  }
  // Left edge bottom → top (stop before the first point to close cleanly)
  for (let i = 1; i < sideSteps; i++) {
    const y = height - margin - (height - 2 * margin) * (i / sideSteps);
    const x = margin + Math.abs(wobble(140));
    points.push([x, y]);
  }

  return points;
}

/** Catmull-Rom spline through `pts` converted to cubic-bezier `path` data.
 *  When `closed`, the curve loops back smoothly. */
function catmullRomPath(pts: [number, number][], closed = true): string {
  if (pts.length < 2) return "";
  const get = (i: number): [number, number] =>
    closed ? pts[((i % pts.length) + pts.length) % pts.length] : pts[Math.max(0, Math.min(pts.length - 1, i))];

  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  const last = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < last; i++) {
    const [p0x, p0y] = get(i - 1);
    const [p1x, p1y] = get(i);
    const [p2x, p2y] = get(i + 1);
    const [p3x, p3y] = get(i + 2);
    const c1x = p1x + (p2x - p0x) / 6;
    const c1y = p1y + (p2y - p0y) / 6;
    const c2x = p2x - (p3x - p1x) / 6;
    const c2y = p2y - (p3y - p1y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2x.toFixed(1)} ${p2y.toFixed(1)}`;
  }
  if (closed) d += " Z";
  return d;
}

interface Sample { x: number; y: number; angle: number }

export function SnakeChain({
  members,
  spacing = 50,
  bgOpacity = 0.55,
  position = "absolute",
  onMemberClick,
  foreground = false,
  interactive = false,
  speed = 30,
  seed = 7,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [samples, setSamples] = useState<Sample[]>([]);
  const [totalLength, setTotalLength] = useState(0);
  const headRef = useRef(0);
  const [, force] = useState(0);

  // measure container — track full document height, not just viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);
    window.addEventListener("resize", update);
    return () => { ro.disconnect(); window.removeEventListener("resize", update); };
  }, []);

  const pathD = useMemo(() => {
    if (!size.w || !size.h) return "";
    const waypoints = buildLoopWaypoints(size.w, size.h, seed);
    return catmullRomPath(waypoints, true);
  }, [size.w, size.h, seed]);

  // Pre-sample path at fine resolution for O(1) lookup + linear interpolation
  useEffect(() => {
    if (!pathRef.current || !pathD) return;
    const path = pathRef.current;
    const total = path.getTotalLength();
    const STEP = 2;
    const count = Math.ceil(total / STEP) + 1;
    const out: Sample[] = new Array(count);
    for (let i = 0; i < count; i++) {
      const d = Math.min(i * STEP, total);
      const p = path.getPointAtLength(d);
      const ahead = path.getPointAtLength(Math.min(d + 1, total));
      out[i] = {
        x: p.x, y: p.y,
        angle: (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI,
      };
    }
    setSamples(out);
    setTotalLength(total);
    headRef.current = 0;
  }, [pathD]);

  // Continuous smooth animation
  useEffect(() => {
    if (totalLength === 0) return;
    const reduceMotion = typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      headRef.current = (headRef.current + speed * dt) % totalLength;
      force((v) => (v + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [totalLength, speed]);

  const positionClass = position === "fixed" ? "fixed inset-0" : "absolute inset-0";
  const STEP = 2;
  const count = Math.min(members.length, totalLength > 0 ? Math.floor(totalLength / spacing) : 0);
  const head = headRef.current;

  // Build per-figure transforms using sub-pixel interpolation between samples
  const tiles: { m: ChainFigure; x: number; y: number; angle: number }[] = [];
  if (samples.length > 1) {
    for (let i = 0; i < count; i++) {
      const m = members[i];
      // #1 leads at the head; higher numbers trail behind along the path.
      // We subtract i*spacing and wrap into [0, totalLength).
      const raw = head - i * spacing;
      const dist = ((raw % totalLength) + totalLength) % totalLength;
      const idxF = dist / STEP;
      const i0 = Math.floor(idxF) % samples.length;
      const i1 = (i0 + 1) % samples.length;
      const frac = idxF - Math.floor(idxF);
      const a = samples[i0];
      const b = samples[i1];
      const x = a.x + (b.x - a.x) * frac;
      const y = a.y + (b.y - a.y) * frac;
      let da = b.angle - a.angle;
      if (da > 180) da -= 360;
      if (da < -180) da += 360;
      const angle = a.angle + da * frac;
      tiles.push({ m, x, y, angle });
    }
  }

  return (
    <div
      ref={containerRef}
      className={`${positionClass} pointer-events-none overflow-hidden`}
      style={{ zIndex: 0 }}
      aria-hidden={!interactive}
    >
      <svg width={size.w} height={size.h} className="absolute top-0 left-0">
        <path ref={pathRef} d={pathD} fill="none" stroke="none" />
      </svg>
      {tiles.map(({ m, x, y, angle }) => (
        <div
          key={m.number}
          className={interactive ? "pointer-events-auto cursor-pointer" : ""}
          onClick={() => interactive && onMemberClick?.(m)}
          style={{
            position: "absolute",
            left: 0, top: 0,
            transform: `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) rotate(${(angle * 0.2).toFixed(2)}deg)`,
            opacity: foreground ? 1 : bgOpacity,
            willChange: "transform",
          }}
        >
          <ChainPerson
            number={m.number}
            skinTone={m.skinTone}
            shirtColour={m.shirtColour}
            hairColour={m.hairColour}
            hairStyle={m.hairStyle}
            build={m.build}
            accessories={m.accessories}
            photoUrl={m.photoUrl}
            isActive={m.isActive}
            size="sm"
            alwaysShowNumber
          />
        </div>
      ))}
    </div>
  );
}
