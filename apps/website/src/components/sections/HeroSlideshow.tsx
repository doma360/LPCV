import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, Quote, Star } from "lucide-react";

type Slide =
  | { type: "pro"; name: string; role: string; zone: string; rating: number }
  | { type: "client"; name: string; zone: string; quote: string };

const slides: Slide[] = [
  { type: "pro", name: "Koffi Services", role: "Plombier", zone: "Cocody", rating: 4.9 },
  { type: "client", name: "Aïcha Koné", zone: "Cocody", quote: "Un plombier vérifié en moins de 20 minutes." },
  { type: "pro", name: "Style Aïcha", role: "Coiffeuse", zone: "Plateau", rating: 4.9 },
  { type: "client", name: "Serge Yao", zone: "Marcory", quote: "Enfin une plateforme fiable pour trouver un artisan." },
  { type: "pro", name: "Électricité Yao", role: "Électricien", zone: "Marcory", rating: 4.8 },
  { type: "client", name: "Fatou Bamba", zone: "Angré", quote: "Le suivi en temps réel change vraiment l'expérience." },
];

const panelTones = [
  "from-brand-700 to-brand-900",
  "from-brand-600 to-brand-800",
  "from-brand-800 to-brand-950",
];

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");
}

export default function HeroSlideshow() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setStep((value) => (value + 1) % slides.length), 3200);
    return () => window.clearInterval(id);
  }, []);

  const slide = slides[step];

  return (
    <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${panelTones[step % panelTones.length]}`} />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex w-full flex-col items-center px-8 text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-accent-400 font-display text-2xl font-bold text-brand-900 shadow-lifted">
            {initialsOf(slide.name)}
          </div>

          {slide.type === "pro" ? (
            <>
              <p className="mt-5 font-display text-lg font-semibold text-white">{slide.name}</p>
              <p className="text-sm text-brand-200">
                {slide.role} · {slide.zone}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-accent-300 backdrop-blur">
                <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" aria-hidden="true" />
                {slide.rating}
                <span className="mx-1 h-1 w-1 rounded-full bg-white/30" />
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Vérifié
              </div>
            </>
          ) : (
            <>
              <Quote className="mt-5 h-5 w-5 text-accent-400" aria-hidden="true" />
              <p className="mt-2 max-w-[26ch] text-sm leading-relaxed text-white/90">"{slide.quote}"</p>
              <p className="mt-4 text-sm font-semibold text-white">{slide.name}</p>
              <p className="text-xs text-brand-200">Client satisfait · {slide.zone}</p>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === step ? "w-5 bg-accent-400" : "w-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
