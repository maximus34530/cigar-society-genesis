import { useEffect } from "react";

/**
 * Injects Plausible and/or Google Analytics when env vars are set.
 * Configure in Vercel: `VITE_PLAUSIBLE_DOMAIN`, `VITE_GA_MEASUREMENT_ID` (optional).
 */
export const AnalyticsScripts = () => {
  useEffect(() => {
    const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
    if (plausibleDomain && !document.querySelector('script[src="https://plausible.io/js/script.js"]')) {
      const s = document.createElement("script");
      s.defer = true;
      s.setAttribute("data-domain", plausibleDomain);
      s.src = "https://plausible.io/js/script.js";
      document.head.appendChild(s);
    }

    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId && !document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`)) {
      const gtagScript = document.createElement("script");
      gtagScript.async = true;
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
      document.head.appendChild(gtagScript);

      const inline = document.createElement("script");
      inline.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${String(gaId).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}', { anonymize_ip: true });
      `;
      document.head.appendChild(inline);
    }
  }, []);

  return null;
};
