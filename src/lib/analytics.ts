declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fires when Plausible and/or GA scripts are loaded (see `AnalyticsScripts`).
 * Safe to call from CTAs; no-ops if analytics are disabled.
 */
export function trackEvent(name: string, props?: Record<string, string>) {
  if (typeof window.plausible === "function") {
    window.plausible(name, props ? { props } : undefined);
  }
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (gaId && typeof window.gtag === "function") {
    window.gtag("event", name, props ?? {});
  }
}
