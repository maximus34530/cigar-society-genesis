import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { useFadeInOnScroll } from "@/hooks/useFadeInOnScroll";
import { useParallax } from "@/hooks/useParallax";
import loungeImg from "@/assets/lounge-seating.jpg";
import humidorImg from "@/assets/humidor.jpg";
import tobacconistCertificateImg from "@/assets/tobacconist_certificate_enhanced.png";
import { business } from "@/lib/business";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const linkClass =
  "font-medium text-primary underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary/90";

const About = () => {
  const parallaxRef = useParallax(0.4);
  const storyFade = useFadeInOnScroll(0);
  const mediaFade = useFadeInOnScroll(80);

  return (
    <Layout>
      <Seo
        title="About Us — Our Story"
        description={`${business.shortName} in Pharr, TX — walk-in humidor, full bar, weekly events, certified professionals, and a lounge built for the Rio Grande Valley. 21+.`}
        path="/about"
      />
      <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden md:min-h-[55vh]">
        <div ref={parallaxRef} className="absolute inset-0 will-change-transform">
          <img
            src={loungeImg}
            alt={`${business.name} lounge`}
            className="absolute inset-0 h-[115%] w-full min-h-full object-cover object-center -top-[7.5%]"
            decoding="async"
            fetchPriority="high"
            loading="eager"
          />
        </div>
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 animate-fade-in px-4 text-center max-w-[min(100%,42rem)] mx-auto">
          <h1 className="hero-heading-glow !font-heading font-bold tracking-tight text-foreground text-balance drop-shadow-[0_2px_24px_hsl(0_0%_0%_/_0.35)] text-[clamp(1.85rem,5vw+0.5rem,3.75rem)] md:text-[clamp(2.5rem,4vw+1rem,3.75rem)]">
            Our Story
          </h1>
        </div>
      </section>

      <section className="section-warm-radial section-padding bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16">
            <div
              ref={storyFade.ref}
              style={storyFade.style}
              className={cn("space-y-6", storyFade.className)}
            >
              <h2 className="!font-heading text-3xl font-semibold text-foreground md:text-4xl">
                Built for the People
              </h2>
              <p className="leading-relaxed text-muted-foreground font-body">
                We opened our doors in 2025 with a vision to bring something different to the Rio Grande Valley—a place
                where quality, comfort, and community come together. Whether you&apos;re a lifelong cigar enthusiast or
                lighting up for the very first time, you&apos;ll find your place here.
              </p>
              <p className="leading-relaxed text-muted-foreground font-body">
                Inside, you&apos;ll find a walk-in humidor stocked with a selection of premium cigars, a full bar offering
                bourbon, beer, and mixed drinks, and a dark lounge atmosphere built for conversation, games, and unwinding.
              </p>
              <p className="leading-relaxed text-muted-foreground font-body">
                And there&apos;s always something happening here at Cigar Society—we host weekly events that bring the
                community together — because a great smoke is even better shared. Live concerts, comedy nights, ladies
                nights, game nights, car meets, etc.
              </p>
              <p className="leading-relaxed text-muted-foreground font-body">
                Not sure where to start?{" "}
                <Link to="/cigars" className={linkClass}>
                  Browse our cigar selection
                </Link>{" "}
                and get expert pairing recommendations — the right smoke for your drink, your mood, and your moment.{" "}
                <Link to="/events" className={linkClass}>
                  Check out our upcoming events
                </Link>{" "}
                so you never miss out on the fun. Look forward to seeing you soon.
              </p>
              <p className="leading-relaxed text-muted-foreground font-body">
                We&apos;re at {business.address} — or just click below for directions.
              </p>
              <div>
                <Button
                  asChild
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <a
                    href={business.googleMapsPlacePageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("Directions", { location: "about-story" })}
                  >
                    Get directions
                  </a>
                </Button>
              </div>
            </div>
            <div
              ref={mediaFade.ref}
              style={mediaFade.style}
              className={cn("flex flex-col gap-8", mediaFade.className)}
            >
              <img
                src={humidorImg}
                alt="Walk-in humidor at Cigar Society"
                className="w-full max-w-full rounded-xl shadow-card ring-1 ring-border/40"
                decoding="async"
                loading="lazy"
              />
              <img
                src={tobacconistCertificateImg}
                alt="Tobacconist University Certified Retail Tobacconist certificate for Cigar Society"
                className="w-full max-w-full rounded-xl border border-border/40 bg-muted/30 object-contain object-center p-3 shadow-card ring-1 ring-border/40"
                decoding="async"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
