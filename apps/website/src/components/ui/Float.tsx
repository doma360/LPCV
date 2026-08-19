import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface FloatProps {
  children?: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  distance?: number;
}

export default function Float({
  children = null,
  className = "",
  duration = 4,
  delay = 0,
  distance = 12,
}: FloatProps) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -distance, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}