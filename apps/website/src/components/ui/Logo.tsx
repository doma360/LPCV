import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  withLabel?: boolean;
}

export default function Logo({ className = "", withLabel = true }: LogoProps) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 font-display text-base font-bold text-white">
        L
      </span>
      {withLabel && (
        <span className="font-display text-lg font-semibold text-ink-900">LPCV</span>
      )}
    </Link>
  );
}
