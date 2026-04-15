import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ScrollParallaxLayerProps = {
  children: ReactNode;
  className?: string;
  /** Scroll multiplier for translateY (e.g. 0.3 ≈ 30% of scroll delta) */
  speed?: number;
};

export function ScrollParallaxLayer({ children, className, speed = 0.3 }: ScrollParallaxLayerProps) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (latest) => (reduce ? 0 : latest * speed));

  return (
    <motion.div style={{ y, willChange: reduce ? undefined : "transform" }} className={cn(className)}>
      {children}
    </motion.div>
  );
}
