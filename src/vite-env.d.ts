/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_ORIGIN?: string;
  readonly VITE_PLAUSIBLE_DOMAIN?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  /** Optional Instagram page URL: profile shows recent-post grid; /p/, /reel/, or /tv/ forces a single embed. */
  readonly VITE_INSTAGRAM_EMBED_PERMALINK?: string;
}
