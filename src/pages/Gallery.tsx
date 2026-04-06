import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { business } from "@/lib/business";
import { CategorizedGallerySection } from "@/components/CategorizedGallerySection";

const Gallery = () => {
  return (
    <Layout>
      <Seo
        title="Gallery — Lounge, Humidor & Events"
        description="Photos of Cigar Society in Pharr, TX—the lounge, cigars, events, and community."
        path="/gallery"
      />

      <section className="relative border-b border-primary/25 bg-gradient-to-b from-background via-background to-muted/40 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden>
          <img
            src="/images/cigar-lounge-bg.jpg"
            alt=""
            className="h-full w-full min-h-full min-w-full object-cover object-center blur-[0.8px] scale-[1.02]"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.375)] to-[rgba(0,0,0,0.45)]" />
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-[0.07] bg-[radial-gradient(ellipse_at_top,hsl(var(--gold)),transparent_55%)]" />
        <div className="container mx-auto section-padding text-center relative z-10 max-w-3xl">
          <p className="text-primary font-body text-xs tracking-[0.35em] uppercase mb-4">La Sociedad</p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground tracking-tight text-balance mb-6">
            Gallery
          </h1>
          <div className="gold-divider mx-auto mb-6 max-w-xs" />
          <p className="text-muted-foreground font-body text-lg leading-relaxed">
            A visual tour of the lounge—humidor, seating, and the details that make {business.shortName} home in
            Pharr. Scroll through each section below.
          </p>
        </div>
      </section>

      <CategorizedGallerySection />
    </Layout>
  );
};

export default Gallery;
