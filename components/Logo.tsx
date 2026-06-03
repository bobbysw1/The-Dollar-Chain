"use client";
import { useId } from "react";

interface Props {
  size?: number;
  className?: string;
  /** colour of the text + chain links */
  color?: string;
}

/**
 * The Dollar Chain emblem: the words "THE DOLLAR CHAIN" curve around the outside
 * of a circle, with a ring of interlocking chain links in the centre.
 */
export function Logo({ size = 40, className = "", color = "#0E9F6E" }: Props) {
  const uid = useId().replace(/:/g, "");
  const textPathId = `lt-${uid}`;
  // 8 chain links forming the centre ring.
  const links = Array.from({ length: 8 }, (_, i) => (i * 360) / 8);

  return (
    <svg
      viewBox="-16 -16 132 132"
      width={size}
      height={size}
      className={className}
      style={{ overflow: "visible" }}
      role="img"
      aria-label="The Dollar Chain"
    >
      <defs>
        {/* circle the text rides on (top starts at 12 o'clock) */}
        <path id={textPathId} d="M 50 4 A 46 46 0 1 1 49.99 4" fill="none" />
      </defs>

      {/* curved wordmark — fills the whole ring */}
      <text
        fill={color}
        fontFamily="var(--font-jakarta), system-ui, sans-serif"
        fontWeight="800"
        fontSize="17.5"
        letterSpacing="3.2"
      >
        <textPath href={`#${textPathId}`} startOffset="0%" textAnchor="start">
          THE · DOLLAR · CHAIN ·
        </textPath>
      </text>

      {/* centre ring of chain links */}
      <g fill="none" stroke={color} strokeWidth="4">
        {links.map((deg) => (
          <g key={deg} transform={`rotate(${deg} 50 50)`}>
            <ellipse cx="50" cy="33" rx="5" ry="8" transform="rotate(90 50 33)" />
          </g>
        ))}
      </g>
    </svg>
  );
}
