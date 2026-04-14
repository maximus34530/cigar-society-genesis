import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { useParallax } from "@/hooks/useParallax";
import { List, MapPin, Star } from "lucide-react";
import liveEventsImg from "@/assets/gallery/events/641257260_17876872920513223_8406291060331286732_n.jpg";
import spiritsBarImg from "@/assets/spirits-bar.png";
import communityHospitalityImg from "@/assets/community-hospitality.png";
import { business } from "@/lib/business";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

type LoungeHighlight = {
  title: string;
  description: string;
  image: string;
  alt: string;
};

const highlights: LoungeHighlight[] = [
  {
    title: "Live Events",
    description:
      "Comedy nights, live concerts, watch parties, ladies nights and more — something's always happening at Cigar Society.",
    image: liveEventsImg,
    alt: "Acoustic performer under the spotlight at Cigar Society — singer with guitar and microphone in blue and warm lounge lighting",
  },
  {
    title: "Spirits & refreshments",
    description: "Bourbon, beer, and mixed drinks in a relaxed lounge built for conversation and unwinding.",
    image: spiritsBarImg,
    alt: "Full bar with premium spirits at Cigar Society",
  },
  {
    title: "South Texas hospitality",
    description: "Located in Pharr with easy access from across the Rio Grande Valley—your destination for an elevated evening out.",
    image: communityHospitalityImg,
    alt: "Guests together at Cigar Society in front of the lounge backdrop",
  },
];

const REVIEWS = [
  { name: "Kevin Garcia", text: "First time here but one of the most chill vibes to relax and to kick back." },
  {
    name: "Hermilo Rodriguez",
    text: "First time here on our way through the valley. Nice vibe as you walk through the door. Decent selection with good service and knowledgeable suggestions. Will be coming through again.",
  },
  {
    name: "Juan Isasi",
    text: "Great atmosphere and staff. My go to place for a cigar with a great variety. The lounge is modern and spacious.",
  },
  { name: "Richard King", text: "Great place and a great experience. Highly recommend." },
  {
    name: "Gerry Flores",
    text: "Stopped by this cigar lounge after my wife pointed it out as we drove by. I was excited at the layout of this very comfortable space. Rick and his wife Priscilla got it right! These owners and their son Brandon provided us with a welcoming experience.",
  },
  {
    name: "Taylor Calderon",
    text: "Great environment and awesome entertainment. The owners, Pricsilla and Rick, are very friendly and welcoming.",
  },
  {
    name: "Domingo De La Garza",
    text: "Cigar Society in Pharr, Texas is easily one of the best spots in the Valley to enjoy a good cigar and unwind in a top-tier atmosphere.",
  },
  { name: "Keely Orta", text: "Fantastic experience! I highly recommend!" },
  {
    name: "Thabata Rada",
    text: "Amazing service. Great atmosphere. Rick and Ray were super helpful and super friendly. They are very knowledgeable. Great quality. Would come again and recommend.",
  },
  {
    name: "Kevin Klapcic",
    text: "Great cigar shop in McAllen. Lots of good sticks and nice bar selection. Rick knows his cigars. Will stop when in McAllen.",
  },
  {
    name: "Edward Villa",
    text: "The fact that they have amazing cigars and they have some air fried foods.... sign me up. I love this place.",
  },
  {
    name: "Edward G",
    text: "An ideal setting for a relaxed evening among friends. The owner and his staff exemplify professionalism, offering thoughtful recommendations and ensuring you experience only the finest selections available.",
  },
  {
    name: "Luis Palacios",
    text: "Great Cigar Lounge! Had the pleasure of visiting Cigar Society — must say, this place has great vibes and great service.",
  },
  {
    name: "David Alvarado",
    text: "Rick is super helpful in choosing a good cigar for a new cigar aficionado like myself, so far his suggestions haven't disappointed. Super chill place to enjoy a cigar while watching the game.",
  },
  {
    name: "Reynaldo Montez",
    text: "Great service but most importantly great ventilation. I went and was able to enjoy my cigar without suffocating in other cigar smokers' smoke — and the place was packed. 10/10 I will be taking my non-smoker friends there to enjoy any events and a great cigar.",
  },
  {
    name: "Gilberto Garcia",
    text: "You have to come check it out. Good cigar varieties, clean and great customer service.",
  },
  { name: "Mario Rosa", text: "Super cool place :) great way to unwind." },
  {
    name: "Tracie Smith",
    text: "What a treat. Excellent selection of cigars, bourbon, beer, or mixed drinks. The lounge has comfortable seating. The staff is knowledgeable. Entertainment and football too.",
  },
  { name: "Michael Lucke", text: "Nice place and wonderful personable owners. Highly recommend." },
  { name: "Aaron Borjas", text: "Great vibe, great choice of cigars, great service — will be coming back!!!" },
];

const HOME_DESCRIPTION =
  "Cigar Society is a premium cigar lounge in Pharr, Texas. Hand-selected cigars, drinks, and a luxury lounge experience in the Rio Grande Valley.";

const heroCtaBase =
  "h-auto min-h-[3rem] rounded-full px-8 py-3.5 font-body text-sm font-medium uppercase tracking-wide transition-all duration-200 sm:w-auto sm:min-w-[11rem]";

const heroPrimaryCta = cn(
  heroCtaBase,
  "!bg-gold-gradient text-primary-foreground shadow-gold hover:!brightness-110 hover:!bg-gold-gradient focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
);

const heroSecondaryCta = cn(
  heroCtaBase,
  "!border-2 !border-primary/60 !bg-background/35 !text-primary backdrop-blur-sm hover:!border-primary hover:!bg-primary/10 hover:!text-primary",
);

const Index = () => {
  const heroVideoPath = business.homeV2VideoPaths[0] ?? "";
  const parallaxRef = useParallax(0.4);

  return (
  <Layout>
    <Seo title="Cigar Society — Premium Cigar Lounge in Pharr, TX" description={HOME_DESCRIPTION} path="/" />
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      <div ref={parallaxRef} className="absolute inset-0 z-0 min-h-[110%] min-w-full will-change-transform">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover bg-background"
          aria-label="Cigar Society lounge cinematic background"
        >
          <source src={heroVideoPath} type="video/mp4" />
        </video>
      </div>
      <div className="absolute inset-0 hero-overlay" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 pb-12 text-center animate-fade-in sm:pb-16">
        <h1 className="hero-heading-glow !font-heading font-bold tracking-tight text-balance text-foreground drop-shadow-[0_2px_24px_hsl(0_0%_0%_/_0.35)] mb-6 text-[clamp(1.85rem,6vw+0.25rem,4.5rem)] sm:text-[clamp(2.25rem,5vw+0.5rem,3.75rem)] md:text-[clamp(3rem,4vw+1rem,4.5rem)]">
          Welcome to <span className="text-gold-gradient">{business.shortName}</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-foreground/85 font-body md:text-lg">
          A premium cigar lounge and bar experience in the Rio Grande Valley.
        </p>
        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
          <Button asChild variant="default" size="lg" className={heroPrimaryCta}>
            <a
              href={business.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("Visit the Lounge", { location: "home-hero", target: "google-maps" })}
            >
              <MapPin className="size-4 opacity-90" aria-hidden />
              Visit the Lounge
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className={heroSecondaryCta}>
            <Link to="/cigars" onClick={() => trackEvent("View Menu", { location: "home-hero" })}>
              <List className="size-4 opacity-90" aria-hidden />
              View Menu
            </Link>
          </Button>
        </div>
      </div>
    </section>

    <section className="section-padding border-t border-border/30 section-warm-radial bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-4xl text-center">
          <SectionHeading title="The Experience" />
          <p className="text-muted-foreground text-lg leading-relaxed font-body max-w-3xl mx-auto">
            We opened in 2025 to bring something different to the Rio Grande Valley—a place where quality, comfort, and
            community come together. With live events, a full bar, and a lounge built for conversation, it&apos;s a space
            to unwind, connect, and enjoy a proper smoke. Whether it&apos;s your first cigar or your hundredth, pull up a
            seat, pick your smoke, and stay a while.
          </p>
          <Button asChild variant="link" className="mt-8 text-primary font-body tracking-wider uppercase text-sm">
            <Link to="/about">Our story →</Link>
          </Button>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto">
          <SectionHeading title="Inside the lounge" subtitle="Comfort, quality, and a warm welcome—every time you walk through the door." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="bg-card rounded-xl border border-border/70 overflow-hidden shadow-card transition-all duration-300 hover:-translate-y-1 premium-card-hover group"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
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

      <section className="section-padding bg-muted/80 border-y border-border/40">
        <div className="container mx-auto">
          <SectionHeading
            title="Cigar marketplace"
            subtitle={`Coming soon — browse and shop highlighted picks from our humidor online. Until then, explore our in-store menu or stop by and call for today's lineup.`}
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
                  In the meantime, explore our in-lounge selection
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/cigars" onClick={() => trackEvent("Marketplace CTA", { location: "home-marketplace-soon" })}>
                Browse our cigar menu
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="section-padding overflow-hidden">
        <div className="container mx-auto text-center mb-10">
          <div className="flex justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-primary fill-primary" />
            ))}
          </div>
          <p className="text-muted-foreground text-sm">Google Reviews · 5.0 Stars</p>
        </div>

        <style>{`
    @keyframes marquee {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .marquee-track {
      display: flex;
      width: max-content;
      animation: marquee 120s linear infinite;
    }
  `}</style>

        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="marquee-track">
            {[...REVIEWS, ...REVIEWS].map((r, i) => (
              <div
                key={i}
                className="mx-3 flex-shrink-0 w-72 rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-foreground text-sm leading-relaxed mb-4 line-clamp-4">&quot;{r.text}&quot;</p>
                <p className="text-muted-foreground text-xs font-medium">— {r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section-padding scroll-mt-24 border-t border-border/40 bg-muted/40">
        <div className="container mx-auto max-w-3xl">
          <SectionHeading
            title="Common questions"
            subtitle="Quick answers before you visit. For anything else, call us or stop by during business hours."
          />
          <div className="space-y-10 text-left">
            <div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3">What are your hours?</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed sm:text-base">
                We&apos;re open {business.hoursText}. Holiday hours can differ—call {business.phoneDisplay} if you want
                to double-check before you head over.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3">Is there an age requirement?</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed sm:text-base">
                Yes. Cigar Society is <span className="text-foreground/90">21+ to enter</span>, consistent with our
                lounge policies. Please bring a valid government-issued ID.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3">Do you allow BYOB?</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed sm:text-base">
                We serve bourbon, beer, and mixed drinks at the bar. Outside bottles and BYOB rules can change with
                events and staffing—call {business.phoneDisplay} before your visit and our team will share the current
                policy.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3">Do you host private events?</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed sm:text-base">
                We&apos;re happy to talk through private events, celebrations, and group visits. Reach us at{" "}
                <a href={`tel:${business.phoneE164}`} className="text-primary underline-offset-4 hover:underline">
                  {business.phoneDisplay}
                </a>{" "}
                or visit during business hours so we can help with availability and details.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                Where are you located, and is there parking?
              </h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed sm:text-base">
                You&apos;ll find us at {business.address} in the Rio Grande Valley. Street and nearby lot parking is
                typically available around our block; for the most up-to-date map and walking directions, use{" "}
                <a
                  href={business.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                  onClick={() => trackEvent("Directions", { location: "home-faq", target: "google-maps" })}
                >
                  Google Maps
                </a>{" "}
                or{" "}
                <a
                  href={business.appleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                  onClick={() => trackEvent("Directions", { location: "home-faq", target: "apple-maps" })}
                >
                  Apple Maps
                </a>
                . You can also jump to our{" "}
                <a href="#find-us" className="text-primary underline-offset-4 hover:underline">
                  Find Us
                </a>{" "}
                section on this page.
              </p>
            </div>
          </div>
          <p className="mt-12 text-center text-sm text-muted-foreground font-body">
            More ways to reach us:{" "}
            <Link to="/contact" className="text-primary underline-offset-4 hover:underline">
              Contact
            </Link>
            .
          </p>
        </div>
      </section>

      <section id="find-us" className="section-padding scroll-mt-24 bg-muted">
        <div className="container mx-auto">
          <SectionHeading
            title="Find Us"
            subtitle={business.address}
            className="!mb-8 md:!mb-10"
          />
          <div className="mb-8 flex flex-wrap items-center justify-center gap-3 md:mb-10">
            <Button
              asChild
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <a
                href={business.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent("Visit the Lounge", { location: "find-us", target: "google-maps" })
                }
              >
                Google Maps
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <a
                href={business.appleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent("Directions", { location: "find-us", target: "apple-maps" })
                }
              >
                Apple Maps
              </a>
            </Button>
          </div>
          <div className="mx-auto max-w-4xl overflow-hidden rounded-lg border border-border shadow-card">
            <iframe
              title={`${business.name} location`}
              src={business.mapEmbedSrc}
              width="100%"
              height="400"
              className="w-full min-h-[280px] border-0 sm:min-h-[400px]"
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

export default Index;
