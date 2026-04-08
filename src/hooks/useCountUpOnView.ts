import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const DURATION_MS = 800;

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

const IO_OPTS: IntersectionObserverInit = { threshold: 0.2, rootMargin: "0px 0px -10% 0px" };

/**
 * Animates an integer from 0 to `target` when the element enters the viewport.
 * Re-runs the observer when `target` changes so async-loaded values still animate.
 */
export function useCountUpOnView(target: number) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [display, setDisplay] = useState(() => (target <= 0 ? target : 0));
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setDisplay(target <= 0 ? target : 0);
  }, [target]);

  useEffect(() => {
    const el = ref.current;
    if (!el || target < 0) return;

    let rafId = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      io.disconnect();

      if (target <= 0) {
        setDisplay(0);
        return;
      }

      if (prefersReducedMotion) {
        setDisplay(target);
        return;
      }

      setDisplay(0);
      const start = performance.now();

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / DURATION_MS);
        setDisplay(Math.round(easeOutCubic(t) * target));
        if (t < 1) {
          rafId = requestAnimationFrame(tick);
        }
      };

      rafId = requestAnimationFrame(tick);
    }, IO_OPTS);

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [target, prefersReducedMotion]);

  return { ref, display };
}
