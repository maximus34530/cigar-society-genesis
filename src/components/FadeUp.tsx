import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const easeLuxury = [0.16, 1, 0.3, 1] as const;

export type FadeUpProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Motion distance in px */
  y?: number;
  /** Duration in seconds (0.6–1.2 recommended) */
  duration?: number;
};

export function FadeUp({ children, className, delay = 0, y = 28, duration = 0.85 }: FadeUpProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration, delay, ease: easeLuxury }}
    >
      {children}
    </motion.div>
  );
}
