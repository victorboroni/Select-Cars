import React from "react";

interface SpecBadgeProps {
  children: React.ReactNode;
  className?: string;
}

// Caption-style pill badge: uppercase, wide tracking, low-noise.
export function SpecBadge({ children, className = "" }: SpecBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-neutral-200 bg-neutral-0 px-3 py-1 uppercase tracking-[0.08em] text-neutral-600 ${className}`}
      style={{ fontSize: "12px", lineHeight: 1.4 }}
    >
      {children}
    </span>
  );
}
