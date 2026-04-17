import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { business } from "@/lib/business";
import { CategorizedGallerySection } from "@/components/CategorizedGallerySection";
import { FadeUp } from "@/components/FadeUp";
import { ScrollParallaxLayer } from "@/components/ScrollParallaxLayer";

const Gallery = () => {
  return (
    <Layout>
      <Seo
        title="Gallery — Lounge, Humidor & Events"
        description="Photos of Cigar Society in Pharr, TX—the lounge, cigars, events, and community."
        path="/gallery"
      />

      <section className="relative overflow-hidden border-b border-primary/25 bg-gradient-to-b from-background via-background to-muted/40">
        <ScrollParallaxLayer
          speed={0.3}
          className="absolute inset-0 -z-10 min-h-[110%] min-w-full pointer-events-none"
          aria-hidden
        >
          <img
            src="/images/cigar-lounge-bg.webp"
            alt=""
            className="absolute inset-0 h-[115%] w-full min-w-full -translate-y-[6%] object-cover object-center blur-[0.8px] scale-[1.02]"
            decoding="async"
            fetchPriority="high"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.375)] to-[rgba(0,0,0,0.45)]" />
        </ScrollParallaxLayer>
        <div className="absolute inset-0 pointer-events-none opacity-[0.07] bg-[radial-gradient(ellipse_at_top,hsl(var(--gold)),transparent_55%)]" />
        <FadeUp className="container relative z-10 mx-auto max-w-3xl px-4 section-padding text-center">
          <p className="mb-4 font-body text-xs uppercase tracking-[0.35em] text-primary">Sociedad del cigarro</p>
          <h1 className="hero-heading-glow mb-6 font-heading text-[clamp(1.85rem,5vw+0.5rem,3.75rem)] font-bold tracking-tight text-balance text-foreground md:text-[clamp(2.5rem,4vw+1rem,3.75rem)]">
            Gallery
          </h1>
          <div className="gold-divider mx-auto mb-6 max-w-xs" />
          <p className="font-body text-lg leading-relaxed text-muted-foreground">
            Every night at {business.shortName} tells a story. Browse the moments, the people, and the experiences that
            make this place home.
          </p>
        </FadeUp>
      </section>

      <CategorizedGallerySection />
    </Layout>
  );
};

export default Gallery;
