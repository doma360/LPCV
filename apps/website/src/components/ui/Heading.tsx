import type { ReactNode } from "react";

type HeadingLevel = "h1" | "h2" | "h3";

interface HeadingProps {
  as?: HeadingLevel;
  eyebrow?: string;
  children: ReactNode;
  align?: "left" | "center";
  tone?: "default" | "inverted";
  className?: string;
}

const sizes: Record<HeadingLevel, string> = {
  h1: "text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05]",
  h2: "text-3xl sm:text-4xl font-semibold leading-tight",
  h3: "text-xl sm:text-2xl font-semibold leading-snug",
};

export default function Heading({
  as = "h2",
  eyebrow,
  children,
  align = "left",
  tone = "default",
  className = "",
}: HeadingProps) {
  const Tag = as;
  const textColor = tone === "inverted" ? "text-white" : "text-ink-900";
  const eyebrowColor =
    tone === "inverted" ? "bg-white/10 text-accent-300" : "bg-brand-50 text-brand-700";

  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow && (
        <span
          className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${eyebrowColor}`}
        >
          {eyebrow}
        </span>
      )}
      <Tag className={`${sizes[as]} ${textColor} ${className}`}>{children}</Tag>
    </div>
  );
}
