/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_ORIGIN?: string;
  readonly VITE_PLAUSIBLE_DOMAIN?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  /** Optional Instagram post/reel permalink for a reliable embed (profile URLs may not render). */
  readonly VITE_INSTAGRAM_EMBED_PERMALINK?: string;
}
