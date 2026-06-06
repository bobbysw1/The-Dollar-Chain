import type { ProjectCategory } from "@/lib/types";

/* Flat, colourful, on-brand illustrations for a cause — one per category.
 * Used when a cause has no uploaded photo (e.g. team-curated causes). */

interface Props {
  category: ProjectCategory;
  className?: string;
}

const BG: Partial<Record<ProjectCategory, string>> = {
  Environment: "#CFEFF0", Wildlife: "#F3E2C7", Parks: "#D8EFC8", Transport: "#D7E3F4",
  Repairs: "#F1E4CE", Potholes: "#DDDDE2", Security: "#DFE0F2", Painting: "#FBE0CE",
  "Beach Cleanup": "#CDEFFB", "Social Work": "#FBD9E4", "Arts & Culture": "#EADCF7",
  Shelter: "#DCE6FB", Food: "#D6F0D9", Rent: "#E6DBF7", Utilities: "#FCEFC9",
  "Youth Sport": "#FDE0CC", Medical: "#FBD7DE", Education: "#CFEDE9", Mowing: "#DCEFC4",
  Personal: "#FBD9EC", Other: "#F1EADC",
};

function Scene({ category }: { category: ProjectCategory }) {
  switch (category) {
    case "Environment":
      return (
        <>
          <circle cx="262" cy="44" r="20" fill="#FFD15C" />
          <path d="M0 120 Q 80 105 160 120 T 320 120 V200 H0 Z" fill="#3FA7C4" />
          <path d="M0 138 Q 80 124 160 138 T 320 138 V200 H0 Z" fill="#2E92B4" />
          {[60, 150, 240].map((x, i) => (
            <path key={i} d={`M${x} 150 q 12 -6 24 0 q 12 6 24 0`} fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.7" />
          ))}
          <path d="M150 70 q 16 26 0 40 q -16 -14 0 -40 Z" fill="#56B6D2" stroke="#2E92B4" strokeWidth="2" />
        </>
      );
    case "Wildlife":
      return (
        <>
          <path d="M0 150 Q 160 130 320 150 V200 H0 Z" fill="#86C98E" />
          <path d="M60 150 V96" stroke="#7A4B28" strokeWidth="6" />
          <ellipse cx="60" cy="80" rx="34" ry="26" fill="#3E9E6E" />
          {/* little bird */}
          <ellipse cx="210" cy="92" rx="26" ry="18" fill="#E8835B" />
          <circle cx="232" cy="84" r="9" fill="#E8835B" />
          <circle cx="235" cy="82" r="2" fill="#1F2937" />
          <path d="M243 84 l10 -3 -8 7 Z" fill="#F2B33D" />
          <path d="M196 96 q 14 10 28 0" fill="#D96C8A" />
        </>
      );
    case "Parks":
      return (
        <>
          <path d="M0 152 H320 V200 H0 Z" fill="#86C98E" />
          {/* tree */}
          <rect x="56" y="92" width="8" height="60" fill="#7A4B28" />
          <circle cx="60" cy="80" r="30" fill="#3E9E6E" />
          {/* swing set */}
          <path d="M196 60 L176 152 M196 60 L236 152 M236 60 L216 152 M236 60 L256 152" stroke="#5B9BD5" strokeWidth="5" />
          <line x1="196" y1="60" x2="236" y2="60" stroke="#5B9BD5" strokeWidth="5" />
          <line x1="210" y1="62" x2="210" y2="112" stroke="#444" strokeWidth="2" />
          <line x1="222" y1="62" x2="222" y2="112" stroke="#444" strokeWidth="2" />
          <rect x="206" y="112" width="20" height="6" rx="3" fill="#F2B33D" />
          <circle cx="280" cy="44" r="18" fill="#FFD15C" />
        </>
      );
    case "Transport":
      return (
        <>
          <rect x="0" y="120" width="320" height="80" fill="#5B6470" />
          {[40, 100, 160, 220, 280].map((x) => (
            <rect key={x} x={x} y="128" width="34" height="64" fill="#F4F4F5" />
          ))}
          {/* pedestrian */}
          <circle cx="160" cy="78" r="12" fill="#E8835B" />
          <rect x="150" y="90" width="20" height="30" rx="8" fill="#0E9F6E" />
        </>
      );
    case "Repairs":
      return (
        <>
          <rect x="0" y="120" width="320" height="80" fill="#CBB58A" />
          <rect x="0" y="120" width="320" height="6" fill="#A98F60" />
          <path d="M150 126 l-8 30 l16 0 z" fill="#A98F60" />
          {/* wrench */}
          <g transform="rotate(40 170 70)">
            <rect x="150" y="44" width="40" height="12" rx="6" fill="#7E6BBF" />
            <circle cx="150" cy="50" r="14" fill="#7E6BBF" />
            <circle cx="150" cy="50" r="6" fill={BG.Repairs} />
          </g>
        </>
      );
    case "Potholes":
      return (
        <>
          <rect x="0" y="110" width="320" height="90" fill="#5B6470" />
          <line x1="0" y1="155" x2="320" y2="155" stroke="#F2B33D" strokeWidth="4" strokeDasharray="24 18" />
          <ellipse cx="150" cy="150" rx="46" ry="22" fill="#2B2F36" />
          <ellipse cx="150" cy="146" rx="34" ry="14" fill="#16181C" />
          {/* cone */}
          <path d="M250 150 l14 -44 l14 44 z" fill="#EA580C" />
          <rect x="244" y="150" width="40" height="8" rx="2" fill="#C2410C" />
        </>
      );
    case "Security":
      return (
        <>
          <rect x="0" y="150" width="320" height="50" fill="#C7C9E6" />
          {/* cctv camera */}
          <rect x="120" y="64" width="60" height="26" rx="6" fill="#3B3F66" />
          <rect x="178" y="70" width="16" height="14" rx="3" fill="#3B3F66" />
          <circle cx="134" cy="77" r="6" fill="#FFD15C" />
          <rect x="96" y="56" width="10" height="30" rx="4" fill="#5B5F8A" />
          {/* light beam */}
          <path d="M194 84 L300 60 L300 120 L194 90 Z" fill="#FFD15C" opacity="0.35" />
        </>
      );
    case "Painting":
      return (
        <>
          <rect x="40" y="40" width="240" height="120" rx="6" fill="#fff" opacity="0.5" />
          <rect x="40" y="40" width="120" height="120" fill="#0E9F6E" opacity="0.85" />
          {/* roller */}
          <rect x="150" y="44" width="60" height="22" rx="5" fill="#5B9BD5" />
          <rect x="206" y="50" width="6" height="40" fill="#7A4B28" />
          <rect x="209" y="86" width="4" height="40" fill="#7A4B28" />
        </>
      );
    case "Beach Cleanup":
      return (
        <>
          <circle cx="262" cy="44" r="18" fill="#FFD15C" />
          <path d="M0 150 Q 160 134 320 150 V200 H0 Z" fill="#F3E1B8" />
          {/* bin */}
          <path d="M130 96 h36 l-4 56 h-28 z" fill="#0E9F6E" />
          <rect x="124" y="88" width="48" height="10" rx="3" fill="#0B7E58" />
          <line x1="140" y1="106" x2="138" y2="142" stroke="#0B7E58" strokeWidth="3" />
          <line x1="156" y1="106" x2="158" y2="142" stroke="#0B7E58" strokeWidth="3" />
          {/* bag */}
          <path d="M196 120 q 6 -16 22 0 l4 32 h-30 z" fill="#5B9BD5" />
        </>
      );
    case "Social Work":
      return (
        <>
          <path d="M0 160 H320 V200 H0 Z" fill="#F7C6D6" />
          {/* heart */}
          <path d="M160 70 q -22 -28 -44 -6 q -16 18 44 56 q 60 -38 44 -56 q -22 -22 -44 6 Z" fill="#D96C8A" />
          {/* cupped hands */}
          <path d="M96 132 q 18 22 64 22 q 46 0 64 -22 q -8 28 -64 28 q -56 0 -64 -28 Z" fill="#E8B68A" />
        </>
      );
    case "Arts & Culture":
      return (
        <>
          {[["#E8835B", 80, 70], ["#F2B33D", 150, 56], ["#5B9BD5", 220, 76], ["#0E9F6E", 120, 110], ["#D96C8A", 200, 116]].map(
            ([c, x, y], i) => <circle key={i} cx={x as number} cy={y as number} r="20" fill={c as string} opacity="0.9" />
          )}
          {/* spray can */}
          <rect x="150" y="120" width="22" height="44" rx="4" fill="#3B3F66" />
          <rect x="154" y="112" width="14" height="10" rx="2" fill="#5B5F8A" />
          <circle cx="161" cy="104" r="3" fill="#7E6BBF" />
        </>
      );
    default:
      return (
        <>
          <circle cx="262" cy="48" r="20" fill="#FFD15C" />
          <ellipse cx="90" cy="160" rx="120" ry="50" fill="#86C98E" opacity="0.7" />
          <ellipse cx="250" cy="166" rx="120" ry="46" fill="#7FBF7A" opacity="0.6" />
          <circle cx="150" cy="120" r="26" fill="#0E9F6E" opacity="0.85" />
        </>
      );
  }
}

export function CauseArt({ category, className = "" }: Props) {
  return (
    <svg viewBox="0 0 320 200" className={className} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${category} illustration`}>
      <rect x="0" y="0" width="320" height="200" fill={BG[category] ?? "#F1EADC"} />
      <Scene category={category} />
    </svg>
  );
}
