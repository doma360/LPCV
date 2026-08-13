import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

type Variant = "primary" | "secondary" | "outline" | "ghost";

type ButtonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  to?: LinkProps["to"];
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

const variants: Record<Variant, string> = {
  primary: "bg-brand-700 text-white hover:bg-brand-800 shadow-soft",
  secondary: "bg-accent-500 text-ink-900 hover:bg-accent-400",
  outline: "border border-ink-200 text-ink-800 hover:border-brand-700 hover:text-brand-700",
  ghost: "text-ink-700 hover:text-brand-700",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none";

export default function Button({
  children,
  variant = "primary",
  className = "",
  to,
  ...props
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
