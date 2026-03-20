import { useState } from "react";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import heroImg from "@/assets/hero-lounge.jpg";
import cigarsImg from "@/assets/cigars-featured.jpg";
import humidorImg from "@/assets/humidor.jpg";
import exteriorImg from "@/assets/exterior.jpg";
import eventImg from "@/assets/event.jpg";
import cigarCloseup from "@/assets/cigar-closeup.jpg";
import loungeSeating from "@/assets/lounge-seating.jpg";
import { business } from "@/lib/business";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const images = [
  { src: heroImg, alt: "Premium cigar lounge interior" },
  { src: humidorImg, alt: "Walk-in humidor" },
  { src: cigarsImg, alt: "Featured cigar selection" },
  { src: eventImg, alt: "Cigar tasting event" },
  { src: exteriorImg, alt: "Lounge exterior" },
  { src: cigarCloseup, alt: "Cigar and cutter close-up" },
  { src: loungeSeating, alt: "Leather lounge seating area" },
  { src: heroImg, alt: "Lounge ambiance" },
];

const Gallery = () => {
  type GalleryImage = (typeof images)[number];
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<GalleryImage | null>(null);

  const openImage = (img: GalleryImage) => {
    setSelected(img);
    setOpen(true);
  };

  return (
    <Layout>
      <Seo
        title="Gallery — Lounge & Humidor"
        description="Photos of the Cigar Society lounge, walk-in humidor, and events in Pharr, TX."
        path="/gallery"
      />
      <section className="section-padding">
        <div className="container mx-auto">
          <SectionHeading title="Gallery" subtitle={`Step inside the ${business.name} experience.`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img, i) => (
              <div
                key={i}
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
                className="relative overflow-hidden rounded-lg group cursor-pointer aspect-[4/3]"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-colors duration-300 flex items-end">
                  <span className="text-foreground font-body text-sm p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {img.alt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background">
            {selected ? (
              <div>
                <img src={selected.src} alt={selected.alt} className="w-full h-auto max-h-[70vh] object-contain" />
                <div className="p-4">
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
