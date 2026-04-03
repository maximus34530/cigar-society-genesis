import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { InstagramFeedEmbed } from "@/components/InstagramFeedEmbed";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
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

const images = [
  { src: heroImg, alt: "Premium cigar lounge interior" },
  { src: humidorImg, alt: "Walk-in humidor" },
  { src: cigarsImg, alt: "Featured cigar selection" },
  { src: eventImg, alt: "Lounge seating and social space" },
  { src: exteriorImg, alt: "Lounge exterior" },
  { src: cigarCloseup, alt: "Premium cigar detail" },
  { src: loungeSeating, alt: "Leather lounge seating area" },
  { src: heroImg, alt: "Lounge ambiance" },
];

const Gallery = () => {
  type GalleryImage = (typeof images)[number];
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<GalleryImage | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);

  const openImage = (img: GalleryImage) => {
    setSelected(img);
    setOpen(true);
  };

  useEffect(() => {
    if (!carouselApi) {
      return;
    }
    const onSelect = () => setActiveIndex(carouselApi.selectedScrollSnap());
    onSelect();
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

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
          <p className="text-center text-xs text-muted-foreground mt-6 max-w-md mx-auto leading-relaxed">
            Having trouble loading the embed? Use the button above to open our profile on Instagram.
          </p>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-b from-background via-muted/15 to-background border-t border-primary/15">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-heading text-2xl md:text-3xl text-center text-foreground mb-2">On the lounge floor</h2>
          <p className="text-center text-muted-foreground text-sm font-body mb-10 max-w-xl mx-auto">
            Swipe on mobile or use the arrows. Tap an image to view larger.
          </p>
          <Carousel
            setApi={setCarouselApi}
            opts={{ loop: true, align: "center" }}
            className="mx-auto w-full max-w-5xl px-10 sm:px-14 md:px-16"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {images.map((img, i) => (
                <CarouselItem key={`${img.alt}-${i}`} className="pl-2 md:pl-4 basis-full">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`Open photo: ${img.alt}`}
                    onClick={() => openImage(img)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openImage(img);
                      }
                    }}
                    className="relative overflow-hidden rounded-xl border border-primary/25 shadow-[0_0_0_1px_hsl(var(--gold)/0.12),0_20px_50px_-20px_hsl(0_0%_0%_/0.5)] outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer group"
                  >
                    <div className="aspect-[4/3] sm:aspect-[16/10] bg-muted">
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        decoding="async"
                        fetchPriority={i === 0 ? "high" : "low"}
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent pt-16 pb-4 px-4">
                      <p className="text-foreground font-body text-sm text-center">{img.alt}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              variant="outline"
              className="border-primary/60 text-primary hover:bg-primary/10 h-9 w-9 sm:h-10 sm:w-10 left-0 sm:left-1 md:-left-4 top-1/2 -translate-y-1/2 z-10 disabled:opacity-35"
            />
            <CarouselNext
              variant="outline"
              className="border-primary/60 text-primary hover:bg-primary/10 h-9 w-9 sm:h-10 sm:w-10 right-0 sm:right-1 md:-right-4 top-1/2 -translate-y-1/2 z-10 disabled:opacity-35"
            />
          </Carousel>
          <div className="flex justify-center gap-2 mt-8" aria-label="Choose a gallery photo">
            {images.map((_, i) => (
              <button
                key={`dot-${i}`}
                type="button"
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                aria-current={i === activeIndex ? "true" : undefined}
                className={cn(
                  "h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  i === activeIndex ? "w-8 bg-primary shadow-[0_0_12px_hsl(var(--gold)/0.35)]" : "w-2 bg-primary/35 hover:bg-primary/55",
                )}
                onClick={() => carouselApi?.scrollTo(i)}
              />
            ))}
          </div>
        </div>

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
