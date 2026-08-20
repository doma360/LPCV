import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import FadeUp from "@/components/ui/FadeUp";

interface Stat {
  target: number;
  decimals?: number;
  prefix?: string;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { target: 800, suffix: "+", label: "Professionnels vérifiés" },
  { target: 12000, suffix: "+", label: "Interventions réalisées" },
  { target: 4.8, decimals: 1, suffix: "/5", label: "Note moyenne client" },
  { target: 15, prefix: "< ", suffix: " min", label: "Temps de réponse moyen" },
];

function StatValue({ target, decimals = 0, prefix = "", suffix }: Stat) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  function start() {
    if (started.current) return;
    started.current = true;
    const duration = 1400;
    const startTime = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const display =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString("fr-FR");

  return (
    <motion.p
      onViewportEnter={start}
      viewport={{ once: true, margin: "-40px" }}
      className="font-display text-3xl font-semibold text-white sm:text-4xl"
    >
      {prefix}
      {display}
      {suffix}
    </motion.p>
  );
}

export default function Stats() {
  return (
    <section className="bg-brand-900 py-16">
      <Container>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <FadeUp key={stat.label} delay={index * 0.08} className="text-center">
              <StatValue {...stat} />
              <p className="mt-2 text-sm text-brand-200">{stat.label}</p>
            </FadeUp>
          ))}
        </div>
      </Container>
    </section>
  );
}
