import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import loungeImg from "@/assets/lounge-seating.jpg";
import humidorImg from "@/assets/humidor.jpg";
import { business } from "@/lib/business";

const About = () => (
  <Layout>
    <Seo
      title="About Us — Our Story & Lounge"
      description="Discover Cigar Society in Pharr, TX: a premium cigar lounge, walk-in humidor, and welcoming community for the Rio Grande Valley."
      path="/about"
    />
    {/* Hero */}
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
          Our Story
        </h1>
        <div className="gold-divider mt-6" />
      </div>
    </section>

    <section className="section-padding">
      <div className="container mx-auto max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-foreground mb-6">A Home for Cigar Enthusiasts</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {business.name} was founded on a simple idea: a great cigar deserves a worthy setting. In Pharr, Texas,
              we built a lounge where the Rio Grande Valley&apos;s aficionados—and newcomers alike—can slow down, connect,
              and enjoy premium tobacco with the same care that goes into every blend we carry.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our walk-in humidor, comfortable leather seating, and warm lighting are all part of one experience: an
              elevated but approachable space to celebrate milestones, close deals, or unwind after the day—with bourbon,
              beer, and mixed drinks available to complement your evening.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you already know your favorite vitola or you&apos;re exploring for the first time, our team is here
              to guide you with genuine hospitality and deep product knowledge.
            </p>
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
      <div className="container mx-auto text-center max-w-3xl">
        <SectionHeading title="Certified Expertise" subtitle="Our team is committed to the highest standards in tobacco knowledge." />
        <div className="bg-card border border-border/70 rounded-xl p-10 shadow-card">
          <h3 className="font-heading text-2xl text-primary mb-4">Certified Cigar Sommelier Tobacconist</h3>
          <p className="text-muted-foreground leading-relaxed">
            {business.name} is led by certified cigar professionals trained through Tobacconist University.
            Our expertise ensures that every recommendation, pairing, and experience is backed by deep
            knowledge and genuine passion for the craft.
          </p>
        </div>
      </div>
    </section>
  </Layout>
);

export default About;
