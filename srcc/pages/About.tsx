import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import loungeImg from "@/assets/lounge-seating.jpg";
import humidorImg from "@/assets/humidor.jpg";
import { business } from "@/lib/business";
import { Star } from "lucide-react";

const googleReviews = [
  "Great vibe great choice of cigars great service will be coming back!!!",
  "Excellent selection of cigars bourbon beer or mixed drinks.",
  "Nice place and wonderful personable owners.",
] as const;

const About = () => (
  <Layout>
    <Seo
      title="About Us — Our Story & Lounge"
      description="Cigar Society in Pharr, TX — CCST-certified sommelier, premium cigars, bourbon, beer, and mixed drinks. 21+ lounge in the Rio Grande Valley."
      path="/about"
    />
    <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
      <img
        src={loungeImg}
        alt={`${business.name} lounge`}
        className="absolute inset-0 w-full h-full object-cover"
        decoding="async"
        fetchPriority="high"
        loading="eager"
      />
      <div className="absolute inset-0 hero-overlay" />
      <div className="relative z-10 text-center px-4 animate-fade-in">
        <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground tracking-tight text-balance drop-shadow-[0_2px_24px_hsl(0_0%_0%_/_0.35)]">
          About Cigar Society
        </h1>
        <div className="gold-divider mt-6" />
      </div>
    </section>

    <section className="section-padding">
      <div className="container mx-auto max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <h2 className="font-heading text-3xl font-semibold text-foreground">Our lounge</h2>
            <p className="text-muted-foreground leading-relaxed">
              {business.name} is a <strong className="text-foreground">premium cigar lounge</strong> at{" "}
              <strong className="text-foreground">116 W State Ave, Pharr, Texas 78577</strong>, offering{" "}
              <strong className="text-foreground">cigars, bourbon, beer, and mixed drinks</strong>. Enjoy a{" "}
              <strong className="text-foreground">dark lounge atmosphere</strong> with{" "}
              <strong className="text-foreground">TVs and lounge seating</strong>—built for conversation, games, and
              unwinding in the Rio Grande Valley.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We are led by <span className="text-foreground font-medium">{`{OWNER_NAME}`}</span>. {`{FOUNDING_STORY}`}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our walk-in humidor and attentive team make it easy whether you already have a favorite vitola or you are
              exploring something new.
            </p>
            <div className="rounded-xl border border-border/70 bg-card/80 p-6 shadow-card space-y-3">
              <h3 className="font-heading text-lg text-primary">Amenities & access</h3>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm leading-relaxed">
                <li>
                  <strong className="text-foreground">Wheelchair accessible</strong> entrance and parking lot
                </li>
                <li>
                  <strong className="text-foreground">Free Wi-Fi</strong>
                </li>
                <li>
                  <strong className="text-foreground">Free parking lot</strong> and free street parking
                </li>
                <li>
                  <strong className="text-foreground">Credit and debit cards</strong> accepted
                </li>
                <li>
                  Guests must be <strong className="text-foreground">21+</strong> to enter and enjoy tobacco and alcohol
                  on site.
                </li>
              </ul>
            </div>
          </div>
          <img
            src={humidorImg}
            alt="Walk-in humidor"
            className="rounded-xl shadow-card ring-1 ring-border/40 w-full"
            decoding="async"
            loading="lazy"
          />
        </div>
      </div>
    </section>

    <section className="section-padding bg-muted/80 border-y border-border/40">
      <div className="container mx-auto max-w-4xl">
        <SectionHeading
          title="Hours"
          subtitle="Stop by Pharr—here is our current weekly schedule."
        />
        <div className="max-w-md mx-auto rounded-xl border border-border/70 bg-card shadow-card overflow-hidden">
          <ul className="divide-y divide-border/60">
            {business.hoursSchedule.map((row) => (
              <li key={row.day} className="flex justify-between gap-4 px-5 py-3 text-sm font-body">
                <span className="text-foreground font-medium">{row.day}</span>
                <span className="text-muted-foreground tabular-nums">{row.hours}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    <section className="section-padding">
      <div className="container mx-auto max-w-3xl text-center">
        <SectionHeading title="Google reviews" subtitle="What guests are saying about us." />
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-7 h-7 fill-primary text-primary" aria-hidden />
            ))}
          </div>
          <p className="font-heading text-xl text-foreground">
            {business.googleRating.stars} <span className="text-muted-foreground font-body text-base">on Google</span>
          </p>
          <span className="text-muted-foreground font-body text-sm">
            ({business.googleRating.reviewCount} reviews)
          </span>
        </div>
        <ul className="space-y-6 text-left list-none p-0 m-0">
          {googleReviews.map((quote) => (
            <li
              key={quote}
              className="border-l-2 border-primary/60 pl-6 py-1 text-muted-foreground italic leading-relaxed font-body"
            >
              &ldquo;{quote}&rdquo;
            </li>
          ))}
        </ul>
      </div>
    </section>

    <section className="section-padding bg-muted/80 border-t border-border/40">
      <div className="container mx-auto text-center max-w-3xl">
        <SectionHeading
          title="Certified expertise"
          subtitle="Formal training through CCST School."
        />
        <div className="bg-card border border-border/70 rounded-xl p-10 shadow-card text-left space-y-6">
          <div>
            <h3 className="font-heading text-2xl text-primary mb-3">CCST School</h3>
            <p className="text-muted-foreground leading-relaxed">
              Cigar Society is a <strong className="text-foreground">CCST Certified Cigar Sommelier</strong> and a{" "}
              <strong className="text-foreground">Certified Retail Tobacconist</strong> through{" "}
              <strong className="text-foreground">CCST School</strong>. Recommendations, pairings, and humidor guidance
              are grounded in professional standards and respect for the craft.
            </p>
          </div>
          <blockquote className="border-l-2 border-primary/60 pl-6 py-1 text-muted-foreground italic leading-relaxed font-body">
            {`{OWNER_QUOTE}`}
          </blockquote>
        </div>
      </div>
    </section>
  </Layout>
);

export default About;
