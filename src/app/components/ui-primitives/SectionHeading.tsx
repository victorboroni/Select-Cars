import React from "react";

interface SectionHeadingProps {
  kicker?: string;
  title: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  display?: boolean;
}

// Section header with optional caption kicker. `display` uses the condensed
// Oswald face in uppercase with wide tracking (the "tech" register).
export function SectionHeading({
  kicker,
  title,
  align = "left",
  className = "",
  display = false,
}: SectionHeadingProps) {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div className={`flex flex-col gap-3 ${alignment} ${className}`}>
      {kicker && (
        <span
          className="uppercase tracking-[0.18em] text-brand-blue-500"
          style={{ fontSize: "12px" }}
        >
          {kicker}
        </span>
      )}
      <h2
        className={display ? "font-display uppercase tracking-[0.06em] text-neutral-900" : "text-neutral-900"}
        style={{ fontSize: display ? "40px" : "32px", fontWeight: 500, lineHeight: 1.1 }}
      >
        {title}
      </h2>
    </div>
  );
}
