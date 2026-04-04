import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Mouse, Star } from "lucide-react";
import cigarCloseup from "@/assets/cigar-closeup.jpg";
import humidorImg from "@/assets/humidor.jpg";
import loungeSeating from "@/assets/lounge-seating.jpg";
import exteriorImg from "@/assets/exterior.jpg";
import { business } from "@/lib/business";
import { trackEvent } from "@/lib/analytics";

const highlights = [
  {
    title: "Walk-in humidor",
    description:
      "Climate-controlled storage and a rotating selection of premium cigars from established and boutique makers.",
    image: humidorImg,
    alt: "Walk-in humidor at Cigar Society",
  },
  {
    title: "Spirits & refreshments",
    description: "Bourbon, beer, and mixed drinks in a relaxed lounge built for conversation and unwinding.",
    image: loungeSeating,
    alt: "Leather lounge seating",
  },
  {
    title: "South Texas hospitality",
    description: "Located in Pharr with easy access from across the Rio Grande Valley—your destination for an elevated evening out.",
    image: exteriorImg,
    alt: "Cigar Society exterior",
  },
];

const HOME_DESCRIPTION =
  "Cigar Society is a premium cigar lounge in Pharr, Texas. Hand-selected cigars, drinks, and a luxury lounge experience in the Rio Grande Valley.";

const heroCtaClassName =
  "bg-gold-gradient text-primary-foreground font-body tracking-wider uppercase text-sm px-8 py-6 shadow-gold hover:opacity-90 transition-opacity";

const Index = () => (
  <Layout>
    <Seo title="Cigar Society — Premium Cigar Lounge in Pharr, TX" description={HOME_DESCRIPTION} path="/" />
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      <img
        src={cigarCloseup}
        alt="Premium cigar with smoke — Cigar Society lounge"
        className="absolute inset-0 h-full w-full object-cover"
        decoding="async"
        fetchPriority="high"
      />
      <div className="absolute inset-0 hero-overlay" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 pb-20 text-center animate-fade-in">
        <h1 className="!font-heading text-4xl font-bold tracking-tight text-balance text-foreground drop-shadow-[0_2px_24px_hsl(0_0%_0%_/_0.35)] sm:text-5xl md:text-7xl mb-6">
          Welcome to <span className="text-gold-gradient">{business.shortName}</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-foreground/85 font-body md:text-lg">
          A premium cigar lounge experience in the Rio Grande Valley.
        </p>
        <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
          <Button asChild size="lg" className={heroCtaClassName}>
            <a
              href="#find-us"
              onClick={() => trackEvent("Visit the Lounge", { location: "home-hero", target: "find-us-map" })}
            >
              Visit the Lounge
            </a>
          </Button>
          <Button asChild size="lg" className={heroCtaClassName}>
            <Link to="/cigars" onClick={() => trackEvent("View Menu", { location: "home-hero" })}>
              View Menu
            </Link>
          </Button>
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-foreground/35"
        aria-hidden
      >
        <Mouse className="mx-auto h-9 w-9" strokeWidth={1.25} />
      </div>
    </section>

      <section className="section-padding border-t border-border/30 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-4xl text-center">
          <SectionHeading title="The Experience" />
          <p className="text-muted-foreground text-lg leading-relaxed font-body max-w-3xl mx-auto">
            {business.name} is built for cigar enthusiasts who value craftsmanship, community, and calm. Our lounge in
            Pharr offers a curated selection of the world&apos;s finest cigars, attentive service, and a setting where
            every detail—from lighting to leather—supports the ritual of a great smoke.
          </p>
          <Button asChild variant="link" className="mt-8 text-primary font-body tracking-wider uppercase text-sm">
            <Link to="/about">Our story →</Link>
          </Button>
        </div>
      </section>

      <section className="section-padding bg-muted/80 border-y border-border/40">
        <div className="container mx-auto">
          <SectionHeading
            title="Featured selections"
            subtitle="Highlighted picks from our humidor will appear here soon. Stop by or call for today’s lineup."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[0, 1, 2].map((slot) => (
              <div
                key={slot}
                className="flex min-h-[220px] md:min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/30 px-6 py-10 text-center ring-1 ring-border/20"
                aria-hidden={slot !== 0}
              >
                <p className="font-heading text-lg font-semibold tracking-wide text-muted-foreground/90 md:text-xl">
                  Coming soon
                </p>
                <p className="mt-3 max-w-[14rem] text-sm text-muted-foreground/70 font-body leading-relaxed">
                  We&apos;re preparing this spotlight for you.
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/contact">Plan your visit</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto">
          <SectionHeading title="Inside the lounge" subtitle="Comfort, quality, and a warm welcome—every time you walk through the door." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="bg-card rounded-xl border border-border/70 overflow-hidden shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card-hover group"
              >
                <div className="overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    decoding="async"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="link" className="text-primary font-body tracking-wider uppercase text-sm">
              <Link to="/gallery">View the gallery →</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="section-padding border-t border-border/30">
        <div className="container mx-auto text-center max-w-2xl">
          <div className="rounded-2xl border border-border/60 bg-card/40 px-8 py-10 md:px-12 md:py-12 shadow-card backdrop-blur-sm">
            <div className="flex justify-center gap-1.5 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-primary fill-primary drop-shadow-[0_0_8px_hsl(var(--gold)/0.35)]" />
              ))}
            </div>
            <blockquote className="font-heading text-2xl md:text-3xl text-foreground/95 italic mb-5 leading-snug text-balance">
              &quot;Great vibe great choice of cigars great service will be coming back !!!&quot;
            </blockquote>
            <p className="text-muted-foreground text-sm font-body tracking-wide">
              {business.googleRating.stars.toFixed(1)} · {business.googleRating.reviewCount} reviews
            </p>
          </div>
        </div>
      </section>

      <section
        id="find-us"
        className="section-padding bg-muted/80 border-t border-border/40 scroll-mt-24"
      >
        <div className="container mx-auto">
          <SectionHeading title="Find us" subtitle={business.address} />
          <div className="rounded-xl overflow-hidden border border-border/70 shadow-card max-w-4xl mx-auto ring-1 ring-border/30">
            <iframe
              title={`${business.name} location`}
              src={business.mapEmbedSrc}
              width="100%"
              height="400"
              className="w-full border-0 min-h-[280px] sm:min-h-[400px]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </Layout>
);

export default Index;
