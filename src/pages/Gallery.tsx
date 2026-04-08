import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { business } from "@/lib/business";
import { CategorizedGallerySection } from "@/components/CategorizedGallerySection";
import { useFadeInOnScroll } from "@/hooks/useFadeInOnScroll";
import { useHeroParallax } from "@/hooks/useHeroParallax";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

const Gallery = () => {
  const { sectionRef, layerRef } = useHeroParallax();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { ref: introRef, visible: introVisible } = useFadeInOnScroll<HTMLElement>();
  const { ref: gridRef, visible: gridVisible } = useFadeInOnScroll<HTMLElement>();

  return (
    <Layout>
      <Seo
        title="Gallery — Lounge, Humidor & Events"
        description="Photos of Cigar Society in Pharr, TX—the lounge, cigars, events, and community."
        path="/gallery"
      />

      <section
        ref={sectionRef}
        className="relative border-b border-primary/25 bg-gradient-to-b from-background via-background to-muted/40 overflow-hidden"
      >
        <div
          ref={layerRef}
          className={cn(
            "absolute inset-0 -z-10 pointer-events-none h-[118%] w-full min-h-full -top-[9%] min-w-full",
            !prefersReducedMotion && "will-change-transform",
          )}
          aria-hidden
        >
          <picture className="contents">
            <source srcSet="/images/cigar-lounge-bg.webp" type="image/webp" />
            <img
              src="/images/cigar-lounge-bg.jpg"
              alt=""
              className="h-full w-full min-h-full min-w-full object-cover object-center blur-[0.8px] scale-[1.02]"
              decoding="async"
              fetchPriority="high"
              loading="eager"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.375)] to-[rgba(0,0,0,0.45)]" />
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-[0.07] bg-[radial-gradient(ellipse_at_top,hsl(var(--gold)),transparent_55%)]" />
        <div
          ref={introRef}
          className={cn(
            "fade-in-scroll-target container mx-auto section-padding text-center relative z-10 max-w-3xl",
            introVisible && "is-visible",
          )}
        >
          <p className="text-primary font-body text-xs tracking-[0.35em] uppercase mb-4">Sociedad del cigarro</p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground tracking-tight text-balance mb-6">
            Gallery
          </h1>
          <div className="gold-divider mx-auto mb-6 max-w-xs" />
          <p className="text-muted-foreground font-body text-lg leading-relaxed">
            Every night at {business.shortName} tells a story. Browse the moments, the people, and the experiences that
            make this place home.
          </p>
        </div>
      </section>

      <div ref={gridRef} className={cn("fade-in-scroll-target", gridVisible && "is-visible")}>
        <CategorizedGallerySection />
      </div>
    </Layout>
  );
};

export default Gallery;
