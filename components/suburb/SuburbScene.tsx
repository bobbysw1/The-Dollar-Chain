import { getSuburb } from "@/lib/suburbs";

/* A flat, colourful, Ecosia-inspired cartoon scene of a southern Gold Coast
 * suburb — sky, sun, hills/headland, a row of buildings, beach, waves and palms.
 * Everything is deterministic per-suburb so each page has its own look. */

interface Props {
  slug: string;
  variant?: "banner" | "card";
  className?: string;
}

const SKIES: [string, string][] = [
  ["#FFE7BA", "#FFF6E4"], // warm morning
  ["#BFE8FB", "#E8F7FE"], // bright day
  ["#FBD3B4", "#FFE9D6"], // sunset
  ["#D6EFC9", "#EEF8E2"], // soft green
  ["#CFE0FB", "#EAF1FE"], // cool blue
];
const SEAS = ["#3FA7C4", "#2E92B4", "#56B6D2", "#3C9CC9"];
const SANDS = ["#F3E1B8", "#F7E8C8", "#EFD9AE"];
const BUILDINGS = ["#E8835B", "#F2B33D", "#6BBF8A", "#5B9BD5", "#D96C8A", "#7E6BBF", "#EA9F4C"];
const HILLS = ["#7FBF7A", "#5FA98C", "#86C98E", "#69B58A"];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

export function SuburbScene({ slug, variant = "banner", className = "" }: Props) {
  const h = hash(slug);
  const sky = SKIES[h % SKIES.length];
  const sea = SEAS[(h >> 2) % SEAS.length];
  const sand = SANDS[(h >> 3) % SANDS.length];
  const hill = HILLS[(h >> 4) % HILLS.length];
  const headland = (h >> 5) % 2 === 0;       // Burleigh-style headland vs gentle hills
  const palmLeft = (h >> 6) % 2 === 0;

  // Build a skyline of 6–8 buildings with varied heights/colours.
  const count = 6 + (h % 3);
  const buildings = Array.from({ length: count }, (_, i) => {
    const r = hash(slug + ":" + i);
    const w = 34 + (r % 18);
    const ht = 34 + (r % 56);
    const colour = BUILDINGS[(r + (h >> 4)) % BUILDINGS.length];
    const roof = (r >> 3) % 3; // 0 flat, 1 pitched, 2 round
    return { w, ht, colour, roof, r };
  });
  const gap = 4;
  const totalW = buildings.reduce((s, b) => s + b.w + gap, 0);
  let x = (400 - totalW) / 2 + (h % 20) - 10;

  const uid = `sc-${slug.replace(/[^a-z0-9]/gi, "")}`;
  const horizon = 118;   // where sand/sea begins
  const seaTop = 128;

  return (
    <svg
      viewBox="0 0 400 170"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`Illustration of ${getSuburb(slug)?.name ?? slug}`}
    >
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sky[0]} />
          <stop offset="100%" stopColor={sky[1]} />
        </linearGradient>
      </defs>

      {/* sky */}
      <rect x="0" y="0" width="400" height="170" fill={`url(#${uid}-sky)`} />

      {/* sun */}
      <circle cx={h % 2 ? 64 : 336} cy="42" r="22" fill="#FFD15C" opacity="0.9" />

      {/* clouds */}
      <g fill="#FFFFFF" opacity="0.85">
        <ellipse cx={120 + (h % 40)} cy="34" rx="26" ry="11" />
        <ellipse cx={140 + (h % 40)} cy="30" rx="18" ry="9" />
        <ellipse cx={250 - (h % 30)} cy="50" rx="20" ry="9" />
      </g>

      {/* back hills / headland */}
      {headland ? (
        <path d={`M0 ${horizon} Q 60 70 130 ${horizon} Z`} fill={hill} opacity="0.9" />
      ) : (
        <>
          <ellipse cx="70" cy={horizon + 6} rx="120" ry="46" fill={hill} opacity="0.65" />
          <ellipse cx="330" cy={horizon + 8} rx="130" ry="42" fill={hill} opacity="0.5" />
        </>
      )}

      {/* skyline of buildings sitting on the horizon */}
      <g>
        {buildings.map((b, i) => {
          const bx = x; x += b.w + gap;
          const by = horizon - b.ht;
          const winCols = Math.max(1, Math.floor(b.w / 12));
          const winRows = Math.max(1, Math.floor(b.ht / 14));
          return (
            <g key={i}>
              {/* roof */}
              {b.roof === 1 && <path d={`M${bx - 2} ${by} L${bx + b.w / 2} ${by - 10} L${bx + b.w + 2} ${by} Z`} fill={b.colour} />}
              {b.roof === 2 && <rect x={bx} y={by - 6} width={b.w} height="12" rx="6" fill={b.colour} />}
              <rect x={bx} y={by} width={b.w} height={b.ht} rx="3" fill={b.colour} />
              {/* windows */}
              {Array.from({ length: winRows * winCols }).map((_, k) => {
                const cx = bx + 6 + (k % winCols) * 12;
                const cy = by + 8 + Math.floor(k / winCols) * 13;
                if (cy > horizon - 5) return null;
                return <rect key={k} x={cx} y={cy} width="5" height="7" rx="1" fill="#FFFFFF" opacity="0.85" />;
              })}
            </g>
          );
        })}
      </g>

      {/* beach + sea */}
      <rect x="0" y={horizon} width="400" height={170 - horizon} fill={sand} />
      <path d={`M0 ${seaTop} Q 200 ${seaTop - 10} 400 ${seaTop} L400 170 L0 170 Z`} fill={sea} />
      {/* wave foam */}
      <path d={`M0 ${seaTop} Q 200 ${seaTop - 10} 400 ${seaTop}`} fill="none" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.7" />
      <path d={`M30 ${seaTop + 14} q 12 -5 24 0 q 12 5 24 0`} fill="none" stroke="#FFFFFF" strokeWidth="1.6" opacity="0.5" />
      <path d={`M300 ${seaTop + 18} q 12 -5 24 0 q 12 5 24 0`} fill="none" stroke="#FFFFFF" strokeWidth="1.6" opacity="0.5" />

      {/* palm trees */}
      {[palmLeft ? 40 : 360, palmLeft ? 360 : 36].map((px, i) => (
        <g key={i} transform={`translate(${px} ${horizon - 2})`}>
          <path d="M-2 0 Q 0 -26 2 0 Z" fill="#7A4B28" />
          <g fill="#2F8F5E">
            <path d="M0 -26 Q -20 -34 -30 -22 Q -16 -28 0 -24 Z" />
            <path d="M0 -26 Q 20 -34 30 -22 Q 16 -28 0 -24 Z" />
            <path d="M0 -26 Q -12 -44 -2 -52 Q -4 -38 2 -26 Z" />
            <path d="M0 -26 Q 12 -44 2 -52 Q 4 -38 -2 -26 Z" />
          </g>
        </g>
      ))}
    </svg>
  );
}
