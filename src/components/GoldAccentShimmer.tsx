import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Barely perceptible gold richness on scroll-in — uses existing --gold / --gold-light tokens.
 */
export function GoldAccentShimmer({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      className={cn("inline bg-gold-shimmer-clip text-transparent", className)}
      initial={{ backgroundPosition: "0% 50%" }}
      whileInView={{ backgroundPosition: "100% 50%" }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 2.4, ease: "easeOut" }}
    >
      {children}
    </motion.span>
  );
}
