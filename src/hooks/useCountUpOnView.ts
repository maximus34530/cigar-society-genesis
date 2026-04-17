import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

const DEFAULT_DURATION_MS = 900;

/**
 * Animates a numeric display from 0 to `target` when the element enters the viewport once.
 */
export function useCountUpOnView(target: number, durationMs = DEFAULT_DURATION_MS) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplay(target);
      return;
    }

    if (target === 0) {
      setDisplay(0);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();

        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs);
          const eased = easeOutCubic(t);
          setDisplay(Math.round(target * eased));
          if (t < 1) {
            rafRef.current = requestAnimationFrame(tick);
          }
        };
        rafRef.current = requestAnimationFrame(tick);
      },
      { threshold: 0.15, rootMargin: "0px" },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs, prefersReducedMotion]);

  return { ref, display };
}
