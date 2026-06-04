/* The Dollar Chain's signature illustration: a circle of diverse little people
 * holding hands — a literal human chain. Flat, friendly, colourful (Ecosia-style).
 * Deterministic, no client JS needed. */

interface Props {
  className?: string;
  /** number of people in the ring */
  count?: number;
}

const SKIN = ["#F6D2BC", "#EFC1A0", "#D9A066", "#B47A4E", "#8D5524", "#5E3A1E"];
const SHIRT = ["#0E9F6E", "#5B9BD5", "#F2B33D", "#E8835B", "#D96C8A", "#7E6BBF", "#3FA7C4", "#EA9F4C"];
const HAIR = ["#2B2B2B", "#5A3A22", "#A8632B", "#C9A24B", "#8A8A8A", "#3D2817"];

export function UnityRing({ className = "", count = 12 }: Props) {
  const cx = 130, cy = 130;
  const ringR = 78;          // radius the linked hands sit on
  const N = count;

  // little "clasped hands" dots between each pair
  const hands = Array.from({ length: N }, (_, i) => {
    const a = ((i + 0.5) * 360) / N;
    const rad = (a * Math.PI) / 180;
    return { x: cx + ringR * Math.sin(rad), y: cy - ringR * Math.cos(rad) };
  });

  return (
    <svg viewBox="0 0 260 260" className={className} role="img" aria-label="A circle of people holding hands">
      {/* soft warm backdrop */}
      <circle cx={cx} cy={cy} r="120" fill="#FFF4E0" />
      <circle cx={cx} cy={cy} r="120" fill="none" stroke="#0E9F6E" strokeWidth="2" strokeDasharray="3 7" opacity="0.35" />
      {/* friendly sun */}
      <circle cx={cx} cy={cy} r="30" fill="#FFD15C" opacity="0.9" />
      <circle cx={cx} cy={cy} r="30" fill="none" stroke="#F4B73D" strokeWidth="2" opacity="0.5" />

      {/* the chain of linked arms */}
      <circle cx={cx} cy={cy} r={ringR} fill="none" stroke="#E7B891" strokeWidth="7" strokeLinecap="round" />
      {hands.map((h, i) => (
        <circle key={i} cx={h.x} cy={h.y} r="4" fill="#D9A877" />
      ))}

      {/* the people, heads facing outward around the ring */}
      {Array.from({ length: N }, (_, i) => {
        const a = (i * 360) / N;
        const skin = SKIN[i % SKIN.length];
        const shirt = SHIRT[(i * 3) % SHIRT.length];
        const hair = HAIR[(i * 2) % HAIR.length];
        const bald = i % 7 === 5;
        return (
          <g key={i} transform={`rotate(${a} ${cx} ${cy})`}>
            {/* origin placed on the ring at 12 o'clock; -y points outward */}
            <g transform={`translate(${cx} ${cy - ringR})`}>
              {/* arms reaching along the ring to clasp neighbours' hands */}
              <path d="M -6 -6 Q -16 -3 -20 1" fill="none" stroke={skin} strokeWidth="3.2" strokeLinecap="round" />
              <path d="M 6 -6 Q 16 -3 20 1" fill="none" stroke={skin} strokeWidth="3.2" strokeLinecap="round" />
              {/* torso (rounded), reaching inward */}
              <path d="M -7.5 -7 Q -9 5 -5.5 12 Q 0 15 5.5 12 Q 9 5 7.5 -7 Q 0 -11.5 -7.5 -7 Z" fill={shirt} />
              {/* head */}
              <circle cx="0" cy="-15.5" r="8" fill={skin} />
              {/* hair cap on the outward side of the head */}
              {!bald && <path d="M -8 -15.5 A 8 8 0 0 1 8 -15.5 Q 0 -20 -8 -15.5 Z" fill={hair} />}
            </g>
          </g>
        );
      })}
    </svg>
  );
}
