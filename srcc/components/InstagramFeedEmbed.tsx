import { useEffect } from "react";
import { business } from "@/lib/business";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const EMBED_SCRIPT_SRC = "https://www.instagram.com/embed.js";

/**
 * Loads Instagram's embed.js and asks it to process oEmbed markup.
 * Profile URLs may not render a full grid; set VITE_INSTAGRAM_EMBED_PERMALINK to a specific post/reel URL for a guaranteed embed.
 */
export function InstagramFeedEmbed() {
  const permalink =
    import.meta.env.VITE_INSTAGRAM_EMBED_PERMALINK ?? business.instagramUrl;

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
    <div className="flex justify-center w-full overflow-x-auto">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={permalink}
        data-instgrm-version="14"
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--gold) / 0.35)",
          borderRadius: 12,
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
