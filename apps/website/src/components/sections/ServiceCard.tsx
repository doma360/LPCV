import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/data/services";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const Icon = service.icon;
  return (
    <Link
      to={`/recherche?metier=${service.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lifted"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 transition-colors group-hover:bg-brand-700">
        <Icon className="h-5 w-5 text-brand-700 transition-colors group-hover:text-white" aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-display text-base font-semibold text-ink-900">{service.name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{service.description}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
        Voir les professionnels
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  );
}
