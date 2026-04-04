import { useState } from "react";
import Layout from "@/components/Layout";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Seo } from "@/components/Seo";
import { InstagramFeedEmbed } from "@/components/InstagramFeedEmbed";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import heroImg from "@/assets/hero-lounge.jpg";
import cigarsImg from "@/assets/cigars-featured.jpg";
import humidorImg from "@/assets/humidor.jpg";
import exteriorImg from "@/assets/exterior.jpg";
import eventImg from "@/assets/event.jpg";
import cigarCloseup from "@/assets/cigar-closeup.jpg";
import loungeSeating from "@/assets/lounge-seating.jpg";
import { business } from "@/lib/business";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Instagram } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const galleryImages = [
  { src: heroImg, alt: "Premium cigar lounge interior" },
  { src: humidorImg, alt: "Walk-in humidor" },
  { src: cigarsImg, alt: "Featured cigar selection" },
  { src: eventImg, alt: "Lounge seating and social space" },
  { src: exteriorImg, alt: "Lounge exterior" },
  { src: cigarCloseup, alt: "Premium cigar detail" },
  { src: loungeSeating, alt: "Leather lounge seating area" },
] as const;

type GalleryImage = (typeof galleryImages)[number];

function LoungePhotoTile({
  img,
  onOpen,
  layout,
}: {
  img: GalleryImage;
  onOpen: (img: GalleryImage) => void;
  layout: "marquee" | "static";
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open photo: ${img.alt}`}
      onClick={() => onOpen(img)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(img);
        }
      }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-primary/25 shadow-[0_0_0_1px_hsl(var(--gold)/0.12),0_20px_50px_-20px_hsl(0_0%_0%_/0.5)] outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer group/card",
        layout === "marquee" && "w-[min(78vw,320px)] shrink-0",
        layout === "static" && "w-full max-w-sm sm:max-w-none sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]",
      )}
    >
      <div className="aspect-[4/3] bg-muted">
        <img
          src={img.src}
          alt=""
          className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-[1.02]"
          decoding="async"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent pt-12 pb-3 px-3">
        <p className="text-foreground font-body text-xs sm:text-sm text-center leading-snug">{img.alt}</p>
      </div>
    </div>
  );
}

const Gallery = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<GalleryImage | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const openImage = (img: GalleryImage) => {
    setSelected(img);
    setOpen(true);
  };

  const marqueeTrack = [...galleryImages, ...galleryImages];

  return (
    <Layout>
      <Seo
        title="Gallery — Lounge, Humidor & Instagram"
        description="Photos of Cigar Society in Pharr, TX and our Instagram feed @cigarsocietystx."
        path="/gallery"
      />

      <section className="relative border-b border-primary/25 bg-gradient-to-b from-background via-background to-muted/40 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.07] bg-[radial-gradient(ellipse_at_top,hsl(var(--gold)),transparent_55%)]" />
        <div className="container mx-auto section-padding text-center relative z-10 max-w-3xl">
          <p className="text-primary font-body text-xs tracking-[0.35em] uppercase mb-4">La Sociedad</p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground tracking-tight text-balance mb-6">
            Gallery
          </h1>
          <div className="gold-divider mx-auto mb-6 max-w-xs" />
          <p className="text-muted-foreground font-body text-lg leading-relaxed">
            A visual tour of the lounge—humidor, seating, and the details that make {business.shortName} home in Pharr.
          </p>
        </div>
      </section>

      <section className="bg-background border-b border-border/50 section-padding">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-heading text-2xl md:text-3xl text-center text-foreground mb-2">Lounge video</h2>
          <p className="text-center text-muted-foreground text-sm font-body mb-8 max-w-xl mx-auto">
            Featured video coming soon.
          </p>
          <div
            className="rounded-xl border-2 border-dashed border-primary/40 bg-muted/30 min-h-[280px] md:min-h-[360px] flex items-center justify-center px-6"
            aria-label="Video embed placeholder"
          >
            <p className="font-mono text-sm text-primary/90 tracking-wide text-center">{`{VIDEO_EMBED}`}</p>
          </div>
        </div>
      </section>

      <section className="bg-muted/20 border-b border-border/50 section-padding">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl md:text-3xl text-center text-foreground mb-2">Instagram</h2>
          <p className="text-center text-muted-foreground text-sm font-body mb-6">
            Follow <span className="text-primary">@{business.instagramHandle}</span> for daily lounge moments.
          </p>
          <div className="flex justify-center mb-8">
            <Button
              asChild
              variant="outline"
              className="border-primary/60 text-primary hover:bg-primary/10 gap-2"
            >
              <a
                href={business.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("Social Click", { location: "gallery", platform: "instagram" })}
              >
                <Instagram className="w-4 h-4" aria-hidden />
                Open @{business.instagramHandle}
              </a>
            </Button>
          </div>
          <InstagramFeedEmbed />
        </div>
      </section>

      <section
        className="section-padding bg-gradient-to-b from-background via-muted/15 to-background border-t border-primary/15"
        aria-label="Inside and around the lounge"
      >
        <div className="container mx-auto max-w-6xl mb-10">
          <h2 className="font-heading text-2xl md:text-3xl text-center text-foreground mb-2">
            Inside & Around the Lounge
          </h2>
          <p className="text-center text-muted-foreground text-sm font-body max-w-xl mx-auto">
            {prefersReducedMotion
              ? "Tap an image to view larger. Auto-scrolling is off because your device prefers reduced motion."
              : "Photos drift side to side—hover the strip to pause. Tap an image to view larger."}
          </p>
        </div>

        <div className="relative w-full overflow-hidden">
          {!prefersReducedMotion ? (
            <>
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-20 bg-gradient-to-r from-background via-background/80 to-transparent"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-20 bg-gradient-to-l from-background via-background/80 to-transparent"
                aria-hidden
              />
              <div className="group">
                <div className="flex w-max gap-4 md:gap-6 py-2 animate-gallery-marquee group-hover:[animation-play-state:paused]">
                  {marqueeTrack.map((img, i) => (
                    <LoungePhotoTile key={`${img.alt}-${i}`} img={img} onOpen={openImage} layout="marquee" />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="container mx-auto flex max-w-6xl flex-wrap justify-center gap-4 md:gap-6 py-2">
              {galleryImages.map((img) => (
                <LoungePhotoTile key={img.alt} img={img} onOpen={openImage} layout="static" />
              ))}
            </div>
          )}
        </div>

        {!prefersReducedMotion ? (
          <p className="text-center text-xs text-muted-foreground mt-8 max-w-md mx-auto">
            Tip: hover the strip to pause and choose a photo.
          </p>
        ) : null}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background border-border">
            {selected ? (
              <div>
                <img
                  src={selected.src}
                  alt={selected.alt}
                  className="w-full h-auto max-h-[70vh] object-contain"
                  decoding="async"
                  fetchPriority="high"
                />
                <div className="p-4 border-t border-border/60">
                  <p className="text-muted-foreground text-sm">{selected.alt}</p>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </section>
    </Layout>
  );
};

export default Gallery;
