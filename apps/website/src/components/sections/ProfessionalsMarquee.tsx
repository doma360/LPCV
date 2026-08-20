import { ShieldCheck, Star } from "lucide-react";
import { professionals } from "@/data/professionals";

const swatches = [
  "bg-brand-700 text-white",
  "bg-accent-400 text-brand-900",
  "bg-success-500 text-white",
  "bg-orange-500 text-white",
];

const loop = [...professionals, ...professionals];

export default function ProfessionalsMarquee() {
  return (
    <section className="border-y border-ink-100 bg-white py-6" aria-label="Professionnels actifs sur LPCV">
      <div className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
          {loop.map((pro, index) => (
            <div
              key={`${pro.id}-${index}`}
              className="flex shrink-0 items-center gap-3 rounded-2xl border border-ink-100 bg-cream-50 px-4 py-2.5 shadow-soft transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lifted"
            >
              <div
                className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  swatches[index % swatches.length]
                }`}
              >
                {pro.name
                  .split(" ")
                  .map((word) => word[0])
                  .slice(0, 2)
                  .join("")}
                {pro.verified && (
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-cream-50 bg-success-500 text-white">
                    <ShieldCheck className="h-2.5 w-2.5" aria-hidden="true" />
                  </span>
                )}
              </div>
              <div className="pr-1">
                <p className="whitespace-nowrap text-sm font-semibold text-ink-900">{pro.name}</p>
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <span>{pro.profession}</span>
                  <span className="inline-flex items-center gap-0.5 font-medium text-accent-700">
                    <Star className="h-3 w-3 fill-accent-500 text-accent-500" aria-hidden="true" />
                    {pro.rating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
