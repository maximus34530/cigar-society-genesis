import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { business } from "@/lib/business";
import { CategorizedGallerySection } from "@/components/CategorizedGallerySection";
import { useFadeInOnScroll } from "@/hooks/useFadeInOnScroll";
import { useParallax } from "@/hooks/useParallax";
import { cn } from "@/lib/utils";

const Gallery = () => {
  const parallaxRef = useParallax(0.4);
  const heroFade = useFadeInOnScroll(0);

  return (
    <Layout>
      <Seo
        title="Gallery — Lounge, Humidor & Events"
        description="Photos of Cigar Society in Pharr, TX—the lounge, cigars, events, and community."
        path="/gallery"
      />

      <section className="relative border-b border-primary/25 bg-gradient-to-b from-background via-background to-muted/40 overflow-hidden">
        <div ref={parallaxRef} className="absolute inset-0 -z-10 pointer-events-none will-change-transform" aria-hidden>
          <img
            src="/images/cigar-lounge-bg.webp"
            alt=""
            className="absolute inset-0 h-[115%] w-full min-w-full -translate-y-[6%] object-cover object-center blur-[0.8px] scale-[1.02]"
            decoding="async"
            fetchPriority="high"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.375)] to-[rgba(0,0,0,0.45)]" />
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-[0.07] bg-[radial-gradient(ellipse_at_top,hsl(var(--gold)),transparent_55%)]" />
        <div
          ref={heroFade.ref}
          style={heroFade.style}
          className={cn(
            "container mx-auto section-padding text-center relative z-10 max-w-3xl px-4",
            heroFade.className,
          )}
        >
          <p className="text-primary font-body text-xs tracking-[0.35em] uppercase mb-4">Sociedad del cigarro</p>
          <h1 className="hero-heading-glow font-heading font-bold text-foreground tracking-tight text-balance mb-6 text-[clamp(1.85rem,5vw+0.5rem,3.75rem)] md:text-[clamp(2.5rem,4vw+1rem,3.75rem)]">
            Gallery
          </h1>
          <div className="gold-divider mx-auto mb-6 max-w-xs" />
          <p className="text-muted-foreground font-body text-lg leading-relaxed">
            Every night at {business.shortName} tells a story. Browse the moments, the people, and the experiences that
            make this place home.
          </p>
        </div>
      </section>

      <CategorizedGallerySection />
    </Layout>
  );
};

export default Gallery;
