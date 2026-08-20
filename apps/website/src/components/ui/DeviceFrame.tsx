import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star, ShieldCheck } from "lucide-react";

interface DeviceFrameProps {
  platform: "android" | "ios";
  /** Une fois la vraie vidéo du parcours mobile prête, passer son chemin ici. */
  videoSrc?: string;
  className?: string;
}

const screens = [
  { title: "Rechercher", sub: "Plombier · Cocody" },
  { title: "Résultats", sub: "6 professionnels trouvés" },
  { title: "Suivi", sub: "Professionnel en route" },
];

export default function DeviceFrame({ platform, videoSrc, className = "" }: DeviceFrameProps) {
  const [step, setStep] = useState(0);
  const isIos = platform === "ios";

  useEffect(() => {
    if (videoSrc) return;
    const id = window.setInterval(() => setStep((value) => (value + 1) % screens.length), 2600);
    return () => window.clearInterval(id);
  }, [videoSrc]);

  return (
    <div
      className={`relative w-[190px] select-none rounded-[2.6rem] border-[8px] border-ink-900 bg-ink-900 shadow-lifted sm:w-[230px] ${className}`}
    >
      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.1rem] bg-brand-950">
        <div
          className={`absolute left-1/2 top-0 z-10 -translate-x-1/2 bg-ink-900 ${
            isIos ? "h-6 w-24 rounded-b-2xl" : "mt-1.5 h-3 w-3 rounded-full"
          }`}
        />
        {videoSrc ? (
          <video className="h-full w-full object-cover" src={videoSrc} autoPlay muted loop playsInline />
        ) : (
          <div className="flex h-full flex-col justify-center px-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3"
              >
                <p className="text-xs font-medium text-brand-200">{screens[step].title}</p>
                <div className="rounded-2xl bg-white p-3.5 shadow-soft">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-[11px] font-semibold text-brand-800">
                      KS
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-ink-900">Koffi Services</p>
                      <p className="text-[10px] text-ink-500">{screens[step].sub}</p>
                    </div>
                    <Star className="h-3.5 w-3.5 shrink-0 fill-accent-500 text-accent-500" aria-hidden="true" />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-medium text-success-500">
                  <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                  Professionnel vérifié
                </div>
              </motion.div>
            </AnimatePresence>
            <p className="mt-6 text-center text-[10px] text-brand-300">Aperçu vidéo bientôt disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}