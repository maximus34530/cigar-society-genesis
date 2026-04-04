import { useState } from "react";
import Layout from "@/components/Layout";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Seo } from "@/components/Seo";
import { InstagramFeedEmbed } from "@/components/InstagramFeedEmbed";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { business } from "@/lib/business";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Instagram } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

type GalleryImage = { src: string; alt: string };

/** macOS screenshot filenames use U+202F between the time and "AM/PM". */
const NNBSP = "\u202f";

const GALLERY_CAPTIONS: Record<string, string> = {
  "641777087_17876480688513223_1895504743949000298_n.jpg": "Unwinding with a hand-rolled cigar",
  [`Screenshot 2026-04-04 at 2.54.38${NNBSP}PM.png`]: "Celebration night in the lounge",
  [`Screenshot 2026-04-04 at 2.55.16${NNBSP}PM.png`]: "Industrial-chic seating for your evening",
  [`Screenshot 2026-04-04 at 2.55.41${NNBSP}PM.png`]: "Cigars, spirits, and South Texas nights",
  [`Screenshot 2026-04-04 at 2.56.58${NNBSP}PM.png`]: "Illuminated humidor wall and premium selection",
  [`Screenshot 2026-04-04 at 2.58.16${NNBSP}PM.png`]: "A perfect pour at the bar",
  [`Screenshot 2026-04-04 at 2.58.26${NNBSP}PM.png`]: "Live acoustic music in the lounge",
  [`Screenshot 2026-04-04 at 3.03.12${NNBSP}PM.png`]: "Friends gathered outside Cigar Society",
  [`Screenshot 2026-04-04 at 3.03.41${NNBSP}PM.png`]: "Blood Medicine cigars at the bar",
  [`Screenshot 2026-04-04 at 3.12.50${NNBSP}PM.png`]: "Premium spirits and hand-picked cigars at the bar",
  [`Screenshot 2026-04-04 at 3.15.37${NNBSP}PM.png`]: "Signature cocktail menu",
  [`Screenshot 2026-04-04 at 3.19.02${NNBSP}PM.png`]: "Rare bourbons and Fuente OpusX on display",
  "Uploaded image.png": "Arriving in style at Cigar Society",
  "tobacconist_certificate_enhanced.png": "Certified Retail Tobacconist credentials",
};

function galleryBasename(modulePath: string): string {
  const parts = modulePath.split("/");
  return parts[parts.length - 1] ?? modulePath;
}

const galleryImageModules = import.meta.glob<{ default: string }>(
  "../assets/gallery/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  { eager: true },
);

const GALLERY_IMAGES: GalleryImage[] = Object.entries(galleryImageModules)
  .map(([path, mod]) => {
    const file = galleryBasename(path);
    return {
      src: mod.default,
      alt: GALLERY_CAPTIONS[file] ?? "Lounge photo",
    };
  })
  .sort((a, b) => a.alt.localeCompare(b.alt, undefined, { sensitivity: "base" }));

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

  const marqueeTrack = [...GALLERY_IMAGES, ...GALLERY_IMAGES];

  const openImage = (img: GalleryImage) => {
    setSelected(img);
    setOpen(true);
  };

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

      <section
        className="section-padding bg-gradient-to-b from-background via-muted/15 to-background border-b border-border/50"
        aria-label="Inside and around the lounge"
      >
        <div className="container mx-auto max-w-6xl mb-10">
          <h2 className="font-heading text-2xl md:text-3xl text-center text-foreground mb-2">
            Inside & Around the Lounge
          </h2>
          <p className="text-center text-muted-foreground text-sm font-body max-w-xl mx-auto">
            {GALLERY_IMAGES.length === 0
              ? "Gallery photos will appear here once images are added to the project gallery folder."
              : prefersReducedMotion
                ? "Tap an image to view larger. Auto-scrolling is off because your device prefers reduced motion."
                : "Photos scroll automatically—tap an image to view larger."}
          </p>
        </div>

        {GALLERY_IMAGES.length > 0 ? (
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
                <div className="flex w-max gap-4 md:gap-6 py-2 animate-gallery-marquee">
                  {marqueeTrack.map((img, i) => (
                    <LoungePhotoTile key={`${img.src}-${i}`} img={img} onOpen={openImage} layout="marquee" />
                  ))}
                </div>
              </>
            ) : (
              <div className="container mx-auto flex max-w-6xl flex-wrap justify-center gap-4 md:gap-6 py-2">
                {GALLERY_IMAGES.map((img) => (
                  <LoungePhotoTile key={img.src} img={img} onOpen={openImage} layout="static" />
                ))}
              </div>
            )}
          </div>
        ) : null}
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
    </Layout>
  );
};

export default Gallery;
