import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import heroImg from "@/assets/hero-lounge.jpg";
import cigarsImg from "@/assets/cigars-featured.jpg";
import eventImg from "@/assets/event.jpg";
import { business } from "@/lib/business";
import { trackEvent } from "@/lib/analytics";

const featuredCigars = [
  { name: "Arturo Fuente Opus X", wrapper: "Rosado", strength: "Full", description: "A legendary Dominican puro with rich, complex flavors of cedar, leather, and spice." },
  { name: "Padrón 1964 Anniversary", wrapper: "Maduro", strength: "Medium-Full", description: "Smooth and creamy with notes of cocoa, coffee, and earth. A timeless classic." },
  { name: "Oliva Serie V Melanio", wrapper: "Ecuadorian Sumatra", strength: "Full", description: "Bold and refined with dark chocolate, espresso, and a peppery finish." },
];

const events = [
  { title: "Cigar Tasting Night", date: "Every Friday", description: "Sample premium cigars from top brands with expert guidance.", image: eventImg },
  { title: "Watch Party Social", date: "Game Nights", description: "Enjoy cigars with friends while watching the big game on our screens.", image: eventImg },
  { title: "New Release Showcase", date: "Monthly", description: "Be the first to try new and limited-edition cigar releases.", image: eventImg },
];

const HOME_DESCRIPTION =
  "Cigar Society is a premium cigar lounge in Pharr, Texas. Enjoy hand-selected cigars, drinks, and a luxury lounge experience in the Rio Grande Valley.";

const HomeV2 = () => {
  const { pathname } = useLocation();
  const [reduceMotion, setReduceMotion] = useState(false);
  const homeV2VideoPath = business.homeV2VideoPaths[0] ?? "";
  const seoPath = pathname === "/" ? "/" : "/home-v2";
  const noIndexDuplicateHome = pathname === "/home-v2";
  const directionsUrl =
    typeof navigator !== "undefined" && /iPad|iPhone|iPod|Macintosh|MacIntel/i.test(navigator.userAgent)
      ? business.appleDirectionsUrl
      : business.googleDirectionsUrl;

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);
    const handler = (event: MediaQueryListEvent) => setReduceMotion(event.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <Layout>
      <Seo
        title="Cigar Society — Premium Cigar Lounge in Pharr, TX"
        description={HOME_DESCRIPTION}
        path={seoPath}
        noIndex={noIndexDuplicateHome}
      />
      {/* Hero (Video) */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {reduceMotion ? (
            <img
              src={heroImg}
              alt="Premium cigar lounge interior"
              className="w-full h-full object-cover"
              decoding="async"
              fetchPriority="high"
              loading="eager"
            />
          ) : (
            <video
              src={homeV2VideoPath}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster={heroImg}
              aria-label="Cigar Society lounge cinematic background"
            />
          )}
          <div className="absolute inset-0 hero-overlay" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-foreground tracking-tight text-balance drop-shadow-[0_2px_24px_hsl(0_0%_0%_/_0.35)]">
            Welcome to <span className="text-gold-gradient">{business.shortName}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground/95 font-body mb-10 max-w-2xl mx-auto leading-relaxed text-balance">
            A premium cigar lounge experience in the Rio Grande Valley.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gold-gradient text-primary-foreground font-body tracking-wider uppercase text-sm px-8 py-6 shadow-gold hover:opacity-90 transition-opacity">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("Directions", { location: "home-hero" })}
              >
                Visit the Lounge
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="section-padding border-t border-border/30 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-4xl text-center">
          <SectionHeading title="The Experience" />
          <p className="text-muted-foreground text-lg leading-relaxed font-body max-w-3xl mx-auto">
            {business.name} is a premium cigar lounge located in Pharr, Texas, built for cigar enthusiasts
            who appreciate craftsmanship, community, and a relaxing atmosphere. Step inside and discover
            a curated selection of the world's finest cigars in an elegant setting designed for conversation,
            celebration, and unwinding.
          </p>
          <Button asChild variant="link" className="mt-8 text-primary font-body tracking-wider uppercase text-sm">
            <Link to="/about">Learn Our Story →</Link>
          </Button>
        </div>
      </section>

      {/* Featured Cigars */}
      <section className="section-padding bg-muted/80 border-y border-border/40">
        <div className="container mx-auto">
          <SectionHeading title="Featured Cigars" subtitle="Hand-selected premium cigars from the world's finest makers." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCigars.map((cigar) => (
              <div
                key={cigar.name}
                className="group bg-card rounded-xl border border-border/70 p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card-hover"
              >
                <img
                  src={cigarsImg}
                  alt={cigar.name}
                  className="w-full h-48 object-cover rounded-lg mb-6 ring-1 ring-border/50 transition-transform duration-500 group-hover:scale-[1.02]"
                  decoding="async"
                  loading="lazy"
                />
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">{cigar.name}</h3>
                <div className="flex gap-3 mb-4 text-xs font-body tracking-wider uppercase text-primary">
                  <span>{cigar.wrapper}</span>
                  <span>·</span>
                  <span>{cigar.strength}</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{cigar.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/cigars">View All Cigars</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Events Preview */}
      <section className="section-padding bg-background">
        <div className="container mx-auto">
          <SectionHeading title="Upcoming Events" subtitle="Join us for exclusive cigar nights, tastings, and social gatherings." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((event) => (
              <div
                key={event.title}
                className="bg-card rounded-xl border border-border/70 overflow-hidden shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card-hover group"
              >
                <div className="overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    decoding="async"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <span className="text-xs font-body tracking-wider uppercase text-primary">{event.date}</span>
                  <h3 className="font-heading text-lg font-semibold text-foreground mt-1 mb-2">{event.title}</h3>
                  <p className="text-muted-foreground text-sm">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="section-padding border-t border-border/30">
        <div className="container mx-auto text-center max-w-2xl">
          <div className="rounded-2xl border border-border/60 bg-card/40 px-8 py-10 md:px-12 md:py-12 shadow-card backdrop-blur-sm">
            <div className="flex justify-center gap-1.5 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-primary fill-primary drop-shadow-[0_0_8px_hsl(var(--gold)/0.35)]" />
              ))}
            </div>
            <blockquote className="font-heading text-2xl md:text-3xl text-foreground/95 italic mb-5 leading-snug text-balance">
              "Great vibe great choice of cigars great service will be coming back !!!"
            </blockquote>
            <p className="text-muted-foreground text-sm font-body tracking-wide">— Google Reviews (5.0 • 27)</p>
          </div>
        </div>
      </section>

      {/* Map / Location */}
      <section className="section-padding bg-muted/80 border-t border-border/40">
        <div className="container mx-auto">
          <SectionHeading title="Find Us" subtitle={business.address} />
          <div className="rounded-xl overflow-hidden border border-border/70 shadow-card max-w-4xl mx-auto ring-1 ring-border/30">
            <iframe
              title={`${business.name} location`}
              src={business.mapEmbedSrc}
              width="100%"
              height="400"
              className="w-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomeV2;

