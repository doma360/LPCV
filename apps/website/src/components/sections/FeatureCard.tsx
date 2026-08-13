import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="h-full rounded-2xl bg-white p-7">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50">
        <Icon className="h-5 w-5 text-accent-600" aria-hidden="true" />
      </div>
      <h3 className="mt-5 font-display text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">{description}</p>
    </div>
  );
}
