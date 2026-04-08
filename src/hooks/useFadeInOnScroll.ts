import { useEffect, useRef, useState } from "react";

const IO_OPTIONS: IntersectionObserverInit = {
  threshold: 0.15,
  rootMargin: "0px 0px -32px 0px",
};

/**
 * Fades in and slides content up 24px when the element crosses the visibility threshold.
 */
export function useFadeInOnScroll<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setVisible(true);
        io.disconnect();
      }
    }, IO_OPTIONS);

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, visible };
}
