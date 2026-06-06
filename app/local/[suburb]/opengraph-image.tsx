import { ImageResponse } from "next/og";
import { getSuburb } from "@/lib/suburbs";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "The Dollar Chain — local improvement fund";

// Brand chain-ring mark as an inline SVG data URI.
const RING = (() => {
  const links = [0, 45, 90, 135, 180, 225, 270, 315]
    .map((d) => `<g transform='rotate(${d} 50 50)'><ellipse cx='50' cy='20' rx='8' ry='13' transform='rotate(90 50 20)'/></g>`)
    .join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><g fill='none' stroke='%230E9F6E' stroke-width='7'>${links}</g></svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
})();

export default async function Image({ params }: { params: { suburb: string } }) {
  const s = getSuburb(params.suburb);
  const name = s?.name ?? "Your suburb";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: "64px 72px",
          background: "linear-gradient(135deg, #FBF8F1 0%, #EAF5EC 100%)", color: "#16241D",
        }}
      >
        {/* brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={RING} width={64} height={64} alt="" />
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: 1, color: "#0E9F6E" }}>
            THE DOLLAR CHAIN
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 800, lineHeight: 1.02 }}>{name}</div>
          <div style={{ display: "flex", fontSize: 60, fontWeight: 700, color: "#0E9F6E", marginTop: 6 }}>
            improvement fund
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#5B6B63", marginTop: 22, maxWidth: 900 }}>
            What locals want fixed — back it with your $1. Every dollar is a vote.
          </div>
        </div>

        {/* footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28 }}>
          <div style={{ display: "flex", fontWeight: 700, color: "#0E9F6E" }}>dollarchain.org</div>
          <div style={{ display: "flex", color: "#5B6B63" }}>An open community fund · Southern Gold Coast</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
