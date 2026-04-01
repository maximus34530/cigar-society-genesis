export const SITE_ORIGIN =
  import.meta.env.VITE_SITE_ORIGIN ?? "https://cigarsocietyus.com";

export function absoluteUrl(path: string): string {
  if (path === "/" || path === "") return SITE_ORIGIN;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized}`;
}

export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-preview.jpg`;
