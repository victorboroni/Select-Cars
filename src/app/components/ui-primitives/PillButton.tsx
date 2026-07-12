import React from "react";

type Variant = "primary" | "outline" | "ghost";

interface PillButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-neutral-900 text-neutral-0 hover:bg-neutral-800 border border-neutral-900",
  outline:
    "bg-transparent text-neutral-900 border border-neutral-200 hover:border-neutral-900",
  ghost:
    "bg-transparent text-neutral-600 border border-transparent hover:text-neutral-900",
};

export function PillButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: PillButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
