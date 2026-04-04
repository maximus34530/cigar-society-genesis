import { useEffect } from "react";
import { business } from "@/lib/business";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const EMBED_SCRIPT_SRC = "https://www.instagram.com/embed.js";

function permalinkWithDarkTheme(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("theme", "dark");
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Loads Instagram's embed.js and asks it to process oEmbed markup.
 * Profile URLs may not render a full grid; set VITE_INSTAGRAM_EMBED_PERMALINK to a specific post/reel URL for a guaranteed embed.
 */
export function InstagramFeedEmbed() {
  const rawPermalink =
    import.meta.env.VITE_INSTAGRAM_EMBED_PERMALINK ?? business.instagramUrl;
  const permalink = permalinkWithDarkTheme(rawPermalink);

  useEffect(() => {
    const runProcess = () => window.instgrm?.Embeds.process();

    const existing = document.querySelector(`script[src="${EMBED_SCRIPT_SRC}"]`);
    if (existing) {
      runProcess();
      return;
    }

    const script = document.createElement("script");
    script.src = EMBED_SCRIPT_SRC;
    script.async = true;
    script.onload = runProcess;
    document.body.appendChild(script);
  }, [permalink]);

  return (
    <div className="instagram-embed-shell flex w-full justify-center overflow-x-auto rounded-xl border border-primary/30 bg-background p-3 shadow-card color-scheme-dark ring-1 ring-inset ring-primary/15 sm:p-4">
      <blockquote
        className="instagram-media !m-0 !bg-transparent"
        data-instgrm-permalink={permalink}
        data-instgrm-version="14"
        data-theme="dark"
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--gold) / 0.28)",
          borderRadius: 10,
          margin: 0,
          maxWidth: 540,
          minWidth: 280,
          padding: 0,
          width: "calc(100% - 2px)",
        }}
      >
        <span className="sr-only">
          Instagram — @{business.instagramHandle}
        </span>
      </blockquote>
    </div>
  );
}

