import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const PARALLAX_SPEED = 0.4;

/**
 * Drives translateY on a background layer at ~40% of scroll delta while the hero is on screen.
 */
export function useHeroParallax() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const layerRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const section = sectionRef.current;
    const layer = layerRef.current;
    if (!section || !layer) return;

    let ticking = false;

    const apply = () => {
      ticking = false;
      const top = section.getBoundingClientRect().top;
      const offset = -top * PARALLAX_SPEED;
      layer.style.transform = `translate3d(0, ${offset}px, 0)`;
    };

    const onScrollOrResize = () => {
      if (ticking) return;
      ticking = true;
      rafRef.current = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      cancelAnimationFrame(rafRef.current);
      layer.style.transform = "";
    };
  }, [prefersReducedMotion]);

  return { sectionRef, layerRef };
}
