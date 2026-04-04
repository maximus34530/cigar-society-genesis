import { business } from "@/lib/business";

/**
 * Builds the official Instagram `/embed/` iframe URL.
 * - Profile URL → grid of recent posts (updates as the account posts).
 * - Post / reel / TV URL → single-media embed (when using VITE_INSTAGRAM_EMBED_PERMALINK).
 */
function buildInstagramEmbedIframeSrc(pageUrl: string): string {
  let pathname: string;
  try {
    pathname = new URL(pageUrl).pathname;
  } catch {
    return `https://www.instagram.com/${business.instagramHandle}/embed/?theme=dark`;
  }

  const parts = pathname.split("/").filter(Boolean);
  const kind = parts[0];
  const code = parts[1];

  if (code && (kind === "p" || kind === "reel" || kind === "tv")) {
    return `https://www.instagram.com/${kind}/${code}/embed/?theme=dark`;
  }

  const username = (kind ?? business.instagramHandle).replace(/^@/, "");
  return `https://www.instagram.com/${username}/embed/?theme=dark`;
}

/**
 * Official Instagram embed iframe — profile URLs show recent posts; no embed.js required.
 * Override with VITE_INSTAGRAM_EMBED_PERMALINK for a fixed post/reel instead of the profile grid.
 */
export function InstagramFeedEmbed() {
  const rawPageUrl =
    import.meta.env.VITE_INSTAGRAM_EMBED_PERMALINK ?? business.instagramUrl;
  const iframeSrc = buildInstagramEmbedIframeSrc(rawPageUrl);

  return (
    <div className="instagram-embed-shell flex w-full justify-center overflow-hidden rounded-xl border border-primary/30 bg-background p-3 shadow-card color-scheme-dark ring-1 ring-inset ring-primary/15 sm:p-4">
      <iframe
        title={`Instagram — @${business.instagramHandle}`}
        src={iframeSrc}
        className="h-[min(85vh,780px)] min-h-[520px] w-full max-w-[540px] shrink-0 rounded-[10px] border border-primary/25 bg-card"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
