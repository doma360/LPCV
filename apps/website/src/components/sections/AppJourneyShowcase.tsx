import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User, Wrench } from "lucide-react";
import Float from "@/components/ui/Float";

type Role = "client" | "pro";

const JOURNEYS: Record<
  Role,
  { label: string; frame: "ios" | "android"; accent: string; images: { src: string; caption: string }[] }
> = {
  client: {
    label: "Parcours Client",
    frame: "ios",
    accent: "#172242",
    images: [
      { src: "/parcours/intro-bienvenue.png", caption: "Bienvenue sur LPCV" },
      { src: "/parcours/client-1-accueil.png", caption: "Trouvez un pro près de vous" },
      { src: "/parcours/client-2-demandes.png", caption: "Suivez vos demandes en direct" },
      { src: "/parcours/client-3-profil.png", caption: "Votre profil, vos avis" },
    ],
  },
  pro: {
    label: "Parcours Pro",
    frame: "android",
    accent: "#FDE235",
    images: [
      { src: "/parcours/intro-bienvenue.png", caption: "Bienvenue sur LPCV" },
      { src: "/parcours/pro-1-dashboard.png", caption: "Recevez des demandes" },
      { src: "/parcours/pro-2-profil.png", caption: "Votre carte membre" },
      { src: "/parcours/pro-3-disponibilites.png", caption: "Gérez vos disponibilités" },
    ],
  },
};

const ROTATE_MS = 2800;

export default function AppJourneyShowcase() {
  const [role, setRole] = useState<Role>("client");
  const [step, setStep] = useState(0);
  const journey = useMemo(() => JOURNEYS[role], [role]);

  useEffect(() => {
    setStep(0);
  }, [role]);

  useEffect(() => {
    const id = window.setInterval(() => setStep((s) => (s + 1) % journey.images.length), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [journey.images.length]);

  const isIos = journey.frame === "ios";

  return (
    <div className="relative flex flex-col items-center">
      {/* Blobs decoratifs animes en fond */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 h-72 w-72 rounded-full blur-3xl"
        style={{ background: journey.accent, opacity: 0.18 }}
        animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Selecteur de parcours - pilule glissante */}
      <div className="relative mb-8 flex rounded-full bg-white/10 p-1.5 backdrop-blur">
        {(["client", "pro"] as const).map((r) => {
          const active = role === r;
          const Icon = r === "client" ? User : Wrench;
          return (
            <button
              key={r}
              onClick={() => setRole(r)}
              className="relative z-10 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
              style={{ color: active ? "#172242" : "#E5E9F5" }}
            >
              {active && (
                <motion.span
                  layoutId="pilule-active"
                  className="absolute inset-0 rounded-full bg-accent-400"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className="relative h-4 w-4" aria-hidden="true" />
              <span className="relative">{JOURNEYS[r].label}</span>
            </button>
          );
        })}
      </div>

      {/* Cadre telephone anime */}
      <Float duration={5} distance={10}>
        <motion.div
          key={journey.frame}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ perspective: 1000 }}
          className={`relative w-[230px] select-none border-ink-900 bg-ink-900 shadow-lifted sm:w-[260px] ${
            isIos ? "rounded-[3rem] border-[10px]" : "rounded-[2.2rem] border-[8px]"
          }`}
        >
          <div
            className={`relative aspect-[9/19.5] overflow-hidden bg-cream-50 ${
              isIos ? "rounded-[2.4rem]" : "rounded-[1.7rem]"
            }`}
          >
            {/* Encoche iOS / poinçon Android */}
            {isIos ? (
              <div className="absolute left-1/2 top-0 z-20 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-ink-900" />
            ) : (
              <div className="absolute left-1/2 top-2.5 z-20 h-3 w-3 -translate-x-1/2 rounded-full bg-ink-900" />
            )}

            <AnimatePresence mode="wait">
              <motion.img
                key={`${role}-${step}`}
                src={journey.images[step].src}
                alt={journey.images[step].caption}
                initial={{ opacity: 0, x: 36, scale: 1.02 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -36, scale: 0.98 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            </AnimatePresence>
          </div>
        </motion.div>
      </Float>

      {/* Legende animee */}
      <AnimatePresence mode="wait">
        <motion.p
          key={`${role}-${step}-caption`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className="mt-6 text-sm font-medium text-brand-200"
        >
          {journey.images[step].caption}
        </motion.p>
      </AnimatePresence>

      {/* Points de progression */}
      <div className="mt-3 flex gap-1.5">
        {journey.images.map((_, i) => (
          <motion.span
            key={i}
            className="h-1.5 rounded-full bg-accent-400"
            animate={{ width: i === step ? 20 : 6, opacity: i === step ? 1 : 0.35 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}
