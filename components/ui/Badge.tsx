import { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: "default" | "accent" | "success" | "muted";
}

const tones = {
  default: "bg-surface text-ink border-border",
  accent: "bg-emerald-50 text-accent border-emerald-100",
  success: "bg-green-50 text-success border-green-100",
  muted: "bg-surface text-muted border-border",
};

export function Badge({ tone = "default", className = "", ...rest }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
      {...rest}
    />
  );
}

export function Dot({ color, className = "" }: { color: string; className?: string }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${className}`}
      style={{ background: color }}
    />
  );
}
