import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/FadeUp";
import { ScrollParallaxLayer } from "@/components/ScrollParallaxLayer";
import { trackEvent } from "@/lib/analytics";

const Cigars = () => {
  return (
    <Layout>
      <Seo
        title="Premium Cigars — Catalog & Selection"
        description="Online cigar marketplace coming soon at Cigar Society in Pharr, TX. Visit the lounge or call for today's humidor lineup — mild to full-bodied selections."
        path="/cigars"
      />
      <section className="relative flex h-[50vh] items-center justify-center overflow-hidden border-b border-primary/25 bg-gradient-to-b from-background via-background to-muted/40">
        <ScrollParallaxLayer
          speed={0.3}
          className="absolute inset-0 -z-10 min-h-[110%] min-w-full pointer-events-none will-change-transform"
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
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[radial-gradient(ellipse_at_top,hsl(var(--gold)),transparent_55%)]"
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-[min(100%,40rem)] px-4 text-center animate-fade-in">
          <h1 className="hero-heading-glow !font-heading text-[clamp(1.85rem,5vw+0.5rem,3.75rem)] font-bold text-foreground md:text-[clamp(2.5rem,4vw+1rem,3.75rem)]">
            Our Cigars
          </h1>
          <div className="gold-divider mx-auto mt-6" />
        </div>
      </section>

      <section className="section-warm-radial section-padding border-y border-border/40 bg-muted/80">
        <FadeUp>
          <div className="container mx-auto min-w-0">
            <SectionHeading
              title="Cigar marketplace"
              subtitle={`Coming soon — browse and shop highlighted picks from our humidor online. Until then, explore our in-store menu or stop by and call for today's lineup.`}
            />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[0, 1, 2].map((slot) => (
                <div
                  key={slot}
                  className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/30 px-6 py-10 text-center ring-1 ring-border/20 md:min-h-[260px]"
                  aria-hidden={slot !== 0}
                >
                  <p className="font-heading text-lg font-semibold tracking-wide text-muted-foreground/90 md:text-xl">
                    Coming soon
                  </p>
                  <p className="mt-3 max-w-[min(100%,14rem)] mx-auto font-body text-sm leading-relaxed text-muted-foreground/70">
                    In the meantime, explore our in-lounge selection
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button asChild variant="luxury">
                <Link to="/contact" onClick={() => trackEvent("Marketplace CTA", { location: "cigars-marketplace-soon" })}>
                  Visit the lounge
                </Link>
              </Button>
            </div>
          </div>
        </FadeUp>
      </section>
    </Layout>
  );
};

export default Cigars;
