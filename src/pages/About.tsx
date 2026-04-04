import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import loungeImg from "@/assets/lounge-seating.jpg";
import humidorImg from "@/assets/humidor.jpg";
import { business } from "@/lib/business";

const About = () => (
  <Layout>
    <Seo
      title="About Us — Our Story"
      description={`${business.name} in Pharr, TX — a refined cigar lounge, walk-in humidor, and certified cigar professionals. Premium cigars, drinks, and hospitality in the Rio Grande Valley. 21+.`}
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
              {business.name} was born from a passion for premium tobacco and the belief that every great cigar deserves
              to be enjoyed in the right setting. Located in the heart of Pharr, Texas, our lounge provides a refined yet
              relaxed environment where enthusiasts come together.
            </p>
            <p className="leading-relaxed text-muted-foreground font-body">
              From our carefully maintained walk-in humidor stocked with the world&apos;s finest cigars to our comfortable
              leather seating and ambient lighting, every detail has been designed to elevate your experience.
            </p>
            <p className="leading-relaxed text-muted-foreground font-body">
              Whether you&apos;re a seasoned aficionado or just beginning your cigar journey, our knowledgeable staff is
              here to guide you to the perfect smoke.
            </p>
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

    <section className="section-padding border-y border-border/40 bg-muted/80">
      <div className="container mx-auto max-w-3xl">
        <SectionHeading
          title="Certified Expertise"
          subtitle="Our team is committed to the highest standards in tobacco knowledge."
        />
        <div className="mx-auto max-w-3xl rounded-xl border border-border/70 bg-card/90 p-8 text-center shadow-card md:p-12">
          <h3 className="!font-heading text-xl font-semibold text-primary md:text-2xl">
            Certified Cigar Sommelier Tobacconist
          </h3>
          <p className="mt-6 leading-relaxed text-muted-foreground font-body">
            {business.name} is led by certified cigar professionals trained through Tobacconist University. Our expertise
            ensures that every recommendation, pairing, and experience is backed by deep knowledge and genuine passion for
            the craft.
          </p>
        </div>
      </div>
    </section>
  </Layout>
);

export default About;
