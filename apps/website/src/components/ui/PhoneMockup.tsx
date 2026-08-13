import { motion } from "framer-motion";
import { Star, ShieldCheck, MapPin } from "lucide-react";

interface PhoneMockupProps {
  className?: string;
}

const preview = [
  { name: "Koffi Services", role: "Plombier", dist: "0.8 km", rating: "4.9" },
  { name: "Électricité Yao", role: "Électricien", dist: "1.4 km", rating: "4.8" },
  { name: "Bâtir Pro", role: "Maçon", dist: "2.1 km", rating: "4.7" },
];

export default function PhoneMockup({ className = "" }: PhoneMockupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: -2 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`relative mx-auto w-[280px] select-none ${className}`}
    >
      <div className="rounded-[2.5rem] border-[10px] border-ink-900 bg-ink-900 shadow-lifted">
        <div className="relative overflow-hidden rounded-[1.9rem] bg-cream-50">
          <div className="absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-ink-900" />
          <div className="bg-brand-800 px-5 pb-8 pt-10">
            <p className="text-xs font-medium text-brand-200">Bonjour Aïcha</p>
            <p className="mt-1 font-display text-lg font-semibold text-white">
              Trouvez un pro près de vous
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur">
              <MapPin className="h-4 w-4 text-accent-400" aria-hidden="true" />
              <span className="text-xs text-white/80">Cocody, Riviera</span>
            </div>
          </div>
          <div className="-mt-4 space-y-3 rounded-t-3xl bg-cream-50 px-4 pb-6 pt-5">
            {preview.map((pro) => (
              <div
                key={pro.name}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-xs font-semibold text-brand-800">
                  {pro.name
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{pro.name}</p>
                  <p className="text-xs text-ink-500">
                    {pro.role} · {pro.dist}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-accent-700">
                  <Star className="h-3.5 w-3.5 fill-accent-500 text-accent-500" aria-hidden="true" />
                  {pro.rating}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center gap-1.5 pt-1 text-xs font-medium text-success-600">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Professionnels vérifiés
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
