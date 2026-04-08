import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const DEFAULT_SPEED = 0.4;

/**
 * Scroll-linked translateY on the target element (e.g. hero background).
 * Movement is proportional to window scroll at `speed` (40% of scroll delta by default).
 */
export function useParallax(speed: number = DEFAULT_SPEED) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const rafRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion) return;

    const apply = () => {
      rafRef.current = 0;
      const y = window.scrollY * speed;
      el.style.transform = `translate3d(0, ${y}px, 0)`;
      el.style.willChange = "transform";
    };

    const onScroll = () => {
      if (rafRef.current !== 0) return;
      rafRef.current = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== 0) cancelAnimationFrame(rafRef.current);
      el.style.transform = "";
      el.style.willChange = "";
    };
  }, [speed, prefersReducedMotion]);

  return ref;
}
