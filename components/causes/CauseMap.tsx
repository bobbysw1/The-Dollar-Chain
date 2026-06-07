import { MapPin } from "lucide-react";

/* A lightweight OpenStreetMap embed (no library) showing where a cause is.
 * Server-friendly — just an iframe of OSM tiles with a marker. */

interface Props {
  lat: number;
  lng: number;
  label?: string;
  className?: string;
  /** bbox half-size in degrees — smaller = more zoomed in */
  zoom?: number;
}

export function CauseMap({ lat, lng, label, className = "", zoom = 0.004 }: Props) {
  const d = zoom;
  const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat},${lng}`;
  const link = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
  return (
    <div className={className}>
      <div className="rounded-card overflow-hidden border border-border bg-surface">
        <iframe
          title={label || "Location map"}
          src={src}
          className="w-full h-56"
          loading="lazy"
          style={{ border: 0 }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-accent" />
          {label || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
        </span>
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
          Open in maps →
        </a>
      </div>
    </div>
  );
}
