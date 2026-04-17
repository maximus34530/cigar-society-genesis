import { useEffect, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const THRESHOLD = 0.15;

export type FadeInOnScrollResult = {
  ref: RefObject<HTMLDivElement>;
  style: CSSProperties;
  className: string;
  visible: boolean;
};

/**
 * Fades in and slides up when the element crosses the viewport threshold.
 * Optional stagger delay (ms) for list items after the element becomes visible.
 */
export function useFadeInOnScroll(staggerDelayMs = 0): FadeInOnScrollResult {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: THRESHOLD },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prefersReducedMotion]);

  const delay = visible ? staggerDelayMs : 0;

  return {
    ref,
    visible,
    className: "fade-in-scroll-target",
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: "opacity 600ms ease-out, transform 600ms ease-out",
      transitionDelay: `${delay}ms`,
    },
  };
}
