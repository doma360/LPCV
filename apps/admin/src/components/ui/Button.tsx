import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "danger" | "ghost";

type ButtonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variants: Record<Variant, string> = {
  primary: "bg-accent-400 text-brand-900 hover:bg-accent-300 shadow-soft",
  outline: "border border-ink-200 text-ink-800 hover:border-brand-700 hover:text-brand-700",
  danger: "bg-danger-500 text-white hover:bg-danger-600",
  ghost: "text-ink-600 hover:text-brand-700",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none";

export default function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
