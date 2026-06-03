import { HTMLAttributes } from "react";

export function Card({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white border border-border rounded-card p-6 shadow-soft ${className}`}
      {...rest}
    />
  );
}
