"use client";
import { memo, useId } from "react";
import type { HairStyle, Accessory, Build } from "@/lib/types";

interface Props {
  number?: number;
  skinTone: string;
  shirtColour: string;
  hairColour: string;
  hairStyle: HairStyle;
  build?: Build;
  accessories?: Accessory[];
  photoUrl?: string;
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  alwaysShowNumber?: boolean;
  className?: string;
}

const SIZES = { sm: 56, md: 84, lg: 132 };
const BUILD_SCALE: Record<Build, number> = { slim: 0.82, regular: 1, broad: 1.3 };

/* ViewBox 100×150. Head centred at (50, 24), r=16. Arms span the full width so
   neighbours touch. Hair is drawn slightly larger than the head so no skin shows
   at the hairline, and on TOP of the head. */

function Hair({ style, colour }: { style: HairStyle; colour: string }) {
  switch (style) {
    case "none":
      return null;
    case "buzz":
      return <path d="M 35 22 C 35 11 65 11 65 22 C 58 19 42 19 35 22 Z" fill={colour} opacity={0.92} />;
    case "short":
      return <path d="M 32 21 C 31 5 69 5 68 21 C 60 24 40 24 32 21 Z" fill={colour} />;
    case "long":
      return (
        <>
          <path d="M 32 20 C 26 38 29 53 35 55 L 38 22 Z" fill={colour} />
          <path d="M 68 20 C 74 38 71 53 65 55 L 62 22 Z" fill={colour} />
          <path d="M 32 21 C 31 5 69 5 68 21 C 60 24 40 24 32 21 Z" fill={colour} />
        </>
      );
    case "curly":
      return (
        <>
          <circle cx="50" cy="9" r="10" fill={colour} />
          <circle cx="40" cy="13" r="9" fill={colour} />
          <circle cx="60" cy="13" r="9" fill={colour} />
          <circle cx="34" cy="20" r="8" fill={colour} />
          <circle cx="66" cy="20" r="8" fill={colour} />
          <circle cx="50" cy="17" r="9" fill={colour} />
        </>
      );
    case "bun":
      return (
        <>
          <circle cx="50" cy="6" r="6.5" fill={colour} />
          <path d="M 33 21 C 33 7 67 7 67 21 C 60 19 40 19 33 21 Z" fill={colour} />
        </>
      );
  }
}

function One({ kind }: { kind: Accessory }) {
  switch (kind) {
    case "cap":
      return (
        <>
          <path d="M 30 21 Q 50 5 70 21 L 70 25 L 30 25 Z" fill="#1F2937" />
          <path d="M 50 23 L 80 22 Q 82 24 80 26 L 50 25 Z" fill="#1F2937" />
        </>
      );
    case "beanie":
      return (
        <>
          <path d="M 31 22 Q 50 4 69 22 Z" fill="#6D5BD0" />
          <rect x="30" y="21" width="40" height="5" rx="2.5" fill="#5847B8" />
          <circle cx="50" cy="6" r="2.5" fill="#5847B8" />
        </>
      );
    case "glasses":
      return (
        <>
          <circle cx="42" cy="27" r="5.5" fill="none" stroke="#0A0A0A" strokeWidth="1.6" />
          <circle cx="58" cy="27" r="5.5" fill="none" stroke="#0A0A0A" strokeWidth="1.6" />
          <line x1="47.5" y1="27" x2="52.5" y2="27" stroke="#0A0A0A" strokeWidth="1.6" />
        </>
      );
    case "sunglasses":
      return (
        <>
          <rect x="36" y="23" width="12" height="8" rx="3" fill="#0A0A0A" />
          <rect x="52" y="23" width="12" height="8" rx="3" fill="#0A0A0A" />
          <line x1="48" y1="26" x2="52" y2="26" stroke="#0A0A0A" strokeWidth="2" />
        </>
      );
    case "bow":
      return (
        <>
          <path d="M 60 12 L 67 9 L 67 17 Z" fill="#DC2626" />
          <path d="M 60 12 L 53 9 L 53 17 Z" fill="#DC2626" />
          <circle cx="60" cy="13" r="2" fill="#A91212" />
        </>
      );
    case "earrings":
      return (
        <>
          <circle cx="34" cy="32" r="1.8" fill="#F5C842" />
          <circle cx="66" cy="32" r="1.8" fill="#F5C842" />
        </>
      );
    case "moustache":
      return <path d="M 42 34 Q 46 37 50 34 Q 54 37 58 34 Q 54 32 50 33 Q 46 32 42 34 Z" fill="#3D2817" />;
    case "freckles":
      return (
        <>
          <circle cx="40" cy="30" r="0.9" fill="#8D5524" opacity={0.6} />
          <circle cx="43" cy="32" r="0.9" fill="#8D5524" opacity={0.6} />
          <circle cx="60" cy="30" r="0.9" fill="#8D5524" opacity={0.6} />
          <circle cx="57" cy="32" r="0.9" fill="#8D5524" opacity={0.6} />
        </>
      );
  }
}

function ChainPersonBase({
  number, skinTone, shirtColour, hairColour, hairStyle,
  build = "regular", accessories = [], photoUrl,
  isActive = true, size = "md", showNumber = false, alwaysShowNumber = false, className = "",
}: Props) {
  const w = SIZES[size];
  const h = Math.round(w * 1.5);
  const uid = useId();
  const skin = isActive ? skinTone : "#D4D4D8";
  const shirt = isActive ? shirtColour : "#D4D4D8";
  const hair = isActive ? hairColour : "#A1A1AA";
  const sx = BUILD_SCALE[build];

  return (
    <div
      className={`relative inline-flex flex-col items-center group ${className}`}
      style={{ width: w, opacity: isActive ? 1 : 0.55 }}
    >
      <svg
        viewBox="-6 -6 112 162"
        width={w}
        height={h}
        aria-label={number !== undefined ? `Chain member #${number}, ${isActive ? "active" : "sleeping"}` : "Chain member"}
        role="img"
        overflow="visible"
      >
        <defs>
          <filter id={`sh-${uid}`} x="-25%" y="-10%" width="150%" height="125%">
            <feDropShadow dx="0" dy="1.6" stdDeviation="1.4" floodOpacity="0.16" />
          </filter>
          <clipPath id={`pc-${uid}`}>
            <rect x="14" y="2" width="72" height="146" rx="14" />
          </clipPath>
        </defs>

        {photoUrl ? (
          <g filter={`url(#sh-${uid})`}>
            <rect x="14" y="2" width="72" height="146" rx="14" fill="#E7E0D2" />
            <image
              href={photoUrl}
              x="14" y="2" width="72" height="146"
              clipPath={`url(#pc-${uid})`}
              preserveAspectRatio="xMidYMid slice"
              style={!isActive ? { filter: "grayscale(1)" } : undefined}
            />
          </g>
        ) : (
          <g filter={`url(#sh-${uid})`}>
            {/* ARMS — full width so neighbours link; not scaled by build */}
            <rect x="0" y="52" width="100" height="12" rx="6" fill={skin} />

            {/* TORSO + LEGS scale horizontally with build (around centre x=50) */}
            <g transform={`translate(50 0) scale(${sx} 1) translate(-50 0)`}>
              <path d="M 38 92 L 38 140 Q 38 146 44 146 L 48 146 Q 50 146 50 140 L 50 92 Z" fill={shirt} />
              <path d="M 62 92 L 62 140 Q 62 146 56 146 L 52 146 Q 50 146 50 140 L 50 92 Z" fill={shirt} />
              <path d="M 34 50 Q 50 45 66 50 L 70 64 Q 73 82 66 96 L 34 96 Q 27 82 30 64 Z" fill={shirt} />
            </g>

            {/* NECK + HEAD (fixed size) */}
            <rect x="46" y="38" width="8" height="10" rx="3" fill={skin} />
            <circle cx="50" cy="24" r="16" fill={skin} />

            <Hair style={hairStyle} colour={hair} />
            {accessories.map((a) => <One key={a} kind={a} />)}
          </g>
        )}
      </svg>

      {showNumber && number !== undefined && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity bg-ink text-white text-[10px] font-mono px-1.5 py-0.5 rounded tabular pointer-events-none whitespace-nowrap">
          #{number}
        </span>
      )}
      {alwaysShowNumber && number !== undefined && (
        <span className="mt-0.5 font-mono tabular text-[9px] text-ink/70 leading-none pointer-events-none select-none">
          #{number}
        </span>
      )}
    </div>
  );
}

export const ChainPerson = memo(ChainPersonBase);
