import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import loungeImg from "@/assets/lounge-seating.jpg";
import humidorImg from "@/assets/humidor.jpg";
import tobacconistCertificateImg from "@/assets/gallery/lounge/tobacconist_certificate_enhanced.png";
import { business } from "@/lib/business";
import { trackEvent } from "@/lib/analytics";

const About = () => (
  <Layout>
    <Seo
      title="About Us — Our Story"
      description={`Family-owned cigar lounge in Pharr, TX — Rick and Priscilla Romo, walk-in humidor, full bar, and weekly events in the Rio Grande Valley. 21+.`}
      path="/about"
    />
    <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden md:min-h-[55vh]">
      <img
        src={loungeImg}
        alt={`${business.name} lounge`}
        className="absolute inset-0 h-full w-full object-cover"
        decoding="async"
        fetchPriority="high"
        loading="eager"
      />
      <div className="absolute inset-0 hero-overlay" />
      <div className="relative z-10 animate-fade-in px-4 text-center">
        <h1 className="!font-heading text-4xl font-bold tracking-tight text-foreground text-balance drop-shadow-[0_2px_24px_hsl(0_0%_0%_/_0.35)] md:text-6xl">
          Our Story
        </h1>
      </div>
    </section>

    <section className="section-padding bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16">
          <div className="space-y-6">
            <h2 className="!font-heading text-3xl font-semibold text-foreground md:text-4xl">
              A Home for Cigar Enthusiasts
            </h2>
            <p className="leading-relaxed text-muted-foreground font-body">
              Rick and Priscilla Romo opened the doors in 2025 with a vision that was personal — a lounge rooted in the
              Rio Grande Valley, designed for the community they love. Not a chain. Not a franchise. A family-owned space
              in the heart of Pharr, Texas, built from passion and opened with purpose.
            </p>
            <p className="leading-relaxed text-muted-foreground font-body">
              From day one, the mission was clear: create a place where everyone belongs. Culturally diverse, genuinely
              welcoming, and unapologetically South Texas. Whether you&apos;re a lifelong cigar enthusiast or lighting up
              for the very first time, you&apos;ll find your place here.
            </p>
            <p className="leading-relaxed text-muted-foreground font-body">
              Inside, you&apos;ll find a walk-in humidor stocked with a carefully curated selection of premium cigars, a
              full bar offering bourbon, beer, and mixed drinks, and a dark lounge atmosphere built for conversation, games,
              and unwinding. Leather seating, ambient lighting, TVs — every detail was chosen with intention.
            </p>
            <p className="leading-relaxed text-muted-foreground font-body">
              And there&apos;s always something happening. Here at Cigar Society, we host weekly events that bring the
              community together — because a great smoke is even better shared.
            </p>
            <p className="leading-relaxed text-muted-foreground font-body">
              Not sure where to start?{" "}
              <Link
                to="/cigars"
                className="font-medium text-primary underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary/90"
              >
                Browse our cigar selection
              </Link>{" "}
              and get expert pairing recommendations — the right smoke for your drink, your mood, and your moment.{" "}
              <a
                href={business.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary/90"
              >
                Check out our upcoming events
              </a>{" "}
              so you never miss out on the fun. And when you&apos;re ready, come see us yourself.
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
          <img
            src={humidorImg}
            alt="Walk-in humidor at Cigar Society"
            className="w-full rounded-xl shadow-card ring-1 ring-border/40"
            decoding="async"
            loading="lazy"
          />
        </div>
      </div>
    </section>

    <section className="section-padding bg-muted/25 border-t border-border/50">
      <div className="container mx-auto max-w-6xl">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <div className="space-y-4 md:order-2">
            <h2 className="!font-heading text-3xl font-semibold text-foreground md:text-4xl">
              Certified Expertise
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground font-body">
              Our team is committed to the highest standards in tobacco knowledge.
            </p>
          </div>
          <div className="space-y-5 md:order-1">
            <img
              src={tobacconistCertificateImg}
              alt="Certified Retail Tobacconist credentials at Cigar Society"
              className="w-full max-h-[min(70vh,520px)] rounded-xl border border-border/40 bg-muted object-contain object-center p-3 shadow-card ring-1 ring-border/40 md:max-h-[560px]"
              decoding="async"
              loading="lazy"
            />
            <p className="text-sm leading-relaxed text-muted-foreground font-body sm:text-base">
              Cigar Society, LLC is led by certified cigar professionals trained through Tobacconist University. Our
              expertise ensures that every recommendation, pairing, and experience is backed by deep knowledge and
              genuine passion for the craft.
            </p>
          </div>
        </div>
      </div>
    </section>
  </Layout>
);

export default About;
