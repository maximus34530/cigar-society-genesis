import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

const Cigars = () => (
  <Layout>
    <Seo
      title="Premium Cigars — Catalog & Selection"
      description="Online cigar marketplace coming soon at Cigar Society in Pharr, TX. Visit the lounge or call for today's humidor lineup — mild to full-bodied selections."
      path="/cigars"
    />
    <section className="relative flex h-[50vh] items-center justify-center overflow-hidden border-b border-primary/25 bg-gradient-to-b from-background via-background to-muted/40">
      <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden>
        <img
          src="/images/cigar-lounge-bg.jpg"
          alt=""
          className="h-full w-full min-h-full min-w-full object-cover object-center blur-[0.8px] scale-[1.02]"
          decoding="async"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.375)] to-[rgba(0,0,0,0.45)]" />
      </div>
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07] bg-[radial-gradient(ellipse_at_top,hsl(var(--gold)),transparent_55%)]"
        aria-hidden
      />
      <div className="relative z-10 animate-fade-in px-4 text-center">
        <h1 className="!font-heading text-4xl font-bold text-foreground md:text-6xl">Our Cigars</h1>
        <div className="gold-divider mt-6" />
      </div>
    </section>

    <section className="section-padding bg-muted/80 border-y border-border/40">
      <div className="container mx-auto">
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
              <p className="mt-3 max-w-[14rem] font-body text-sm leading-relaxed text-muted-foreground/70">
                Marketplace listings will appear here when we launch.
              </p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button
            asChild
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Link to="/contact" onClick={() => trackEvent("Marketplace CTA", { location: "cigars-marketplace-soon" })}>
              Visit the lounge
            </Link>
          </Button>
        </div>
      </div>
    </section>
  </Layout>
);

export default Cigars;
