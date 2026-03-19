import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import loungeImg from "@/assets/lounge-seating.jpg";
import humidorImg from "@/assets/humidor.jpg";
import { business } from "@/lib/business";

const About = () => (
  <Layout>
    {/* Hero */}
    <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
      <img src={loungeImg} alt={`${business.name} lounge`} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-background/75" />
      <div className="relative z-10 text-center px-4 animate-fade-in">
        <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground">Our Story</h1>
        <div className="gold-divider mt-6" />
      </div>
    </section>

    <section className="section-padding">
      <div className="container mx-auto max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-foreground mb-6">A Home for Cigar Enthusiasts</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {business.name} was born from a passion for premium tobacco and the belief that every great cigar
              deserves to be enjoyed in the right setting. Located in the heart of Pharr, Texas, our lounge
              provides a refined yet relaxed environment where enthusiasts come together.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              From our carefully maintained walk-in humidor stocked with the world's finest cigars to our
              comfortable leather seating and ambient lighting, every detail has been designed to elevate your experience.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you're a seasoned aficionado or just beginning your cigar journey, our knowledgeable
              staff is here to guide you to the perfect smoke.
            </p>
          </div>
          <img src={humidorImg} alt="Walk-in humidor" className="rounded-lg shadow-card w-full" loading="lazy" />
        </div>
      </div>
    </section>

    <section className="section-padding bg-muted">
      <div className="container mx-auto text-center max-w-3xl">
        <SectionHeading title="Certified Expertise" subtitle="Our team is committed to the highest standards in tobacco knowledge." />
        <div className="bg-card border border-border rounded-lg p-10 shadow-card">
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
