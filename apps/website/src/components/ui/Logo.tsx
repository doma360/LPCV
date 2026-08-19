import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  withLabel?: boolean;
  tone?: "default" | "inverted";
}

export default function Logo({ className = "", withLabel = true, tone = "default" }: LogoProps) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-400 font-display text-base font-bold text-brand-900">
        L
      </span>
      {withLabel && (
        <span
          className={`font-display text-lg font-semibold ${
            tone === "inverted" ? "text-white" : "text-ink-900"
          }`}
        >
          LPCV
        </span>
      )}
    </Link>
  );
}