import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Star, Lock, Calendar, Gift, Armchair, Crown } from "lucide-react";
import heroImg from "@/assets/hero-lounge.jpg";
import cigarsImg from "@/assets/cigars-featured.jpg";
import eventImg from "@/assets/event.jpg";

const featuredCigars = [
  { name: "Arturo Fuente Opus X", wrapper: "Rosado", strength: "Full", description: "A legendary Dominican puro with rich, complex flavors of cedar, leather, and spice." },
  { name: "Padrón 1964 Anniversary", wrapper: "Maduro", strength: "Medium-Full", description: "Smooth and creamy with notes of cocoa, coffee, and earth. A timeless classic." },
  { name: "Oliva Serie V Melanio", wrapper: "Ecuadorian Sumatra", strength: "Full", description: "Bold and refined with dark chocolate, espresso, and a peppery finish." },
];

const memberBenefits = [
  { icon: Lock, label: "Private Locker Storage" },
  { icon: Calendar, label: "Exclusive Events" },
  { icon: Gift, label: "Member Cigar Drops" },
  { icon: Armchair, label: "Priority Seating" },
  { icon: Crown, label: "Lounge Discounts" },
];

const events = [
  { title: "Cigar Tasting Night", date: "Every Friday", description: "Sample premium cigars from top brands with expert guidance.", image: eventImg },
  { title: "Watch Party Social", date: "Game Nights", description: "Enjoy cigars with friends while watching the big game on our screens.", image: eventImg },
  { title: "New Release Showcase", date: "Monthly", description: "Be the first to try new and limited-edition cigar releases.", image: eventImg },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Premium cigar lounge interior" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-background/70" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-foreground">
            Welcome to <span className="text-gold-gradient">Cigar Society US</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-body mb-10 max-w-2xl mx-auto leading-relaxed">
            A premium cigar lounge experience in the Rio Grande Valley.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gold-gradient text-primary-foreground font-body tracking-wider uppercase text-sm px-8 py-6 shadow-gold hover:opacity-90 transition-opacity">
              <Link to="/contact">Visit the Lounge</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary text-primary font-body tracking-wider uppercase text-sm px-8 py-6 hover:bg-primary hover:text-primary-foreground transition-colors">
              <Link to="/membership">Join La Sociedad</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="section-padding">
        <div className="container mx-auto max-w-4xl text-center">
          <SectionHeading title="The Experience" />
          <p className="text-muted-foreground text-lg leading-relaxed font-body">
            Cigar Society US is a premium cigar lounge located in Pharr, Texas, built for cigar enthusiasts
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
      <section className="section-padding bg-muted">
        <div className="container mx-auto">
          <SectionHeading title="Featured Cigars" subtitle="Hand-selected premium cigars from the world's finest makers." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCigars.map((cigar) => (
              <div key={cigar.name} className="bg-card rounded-lg border border-border p-8 shadow-card hover:border-primary/30 transition-colors">
                <img src={cigarsImg} alt={cigar.name} className="w-full h-48 object-cover rounded-md mb-6" loading="lazy" />
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

      {/* Membership */}
      <section className="section-padding relative overflow-hidden">
        <div className="container mx-auto text-center">
          <SectionHeading title="La Sociedad Membership" subtitle="Exclusive membership for cigar enthusiasts offering premium lounge perks." />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-3xl mx-auto mb-12">
            {memberBenefits.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-body text-muted-foreground text-center">{label}</span>
              </div>
            ))}
          </div>
          <Button asChild size="lg" className="bg-gold-gradient text-primary-foreground font-body tracking-wider uppercase text-sm px-8 py-6 shadow-gold hover:opacity-90">
            <Link to="/membership">Join Membership</Link>
          </Button>
        </div>
      </section>

      {/* Events Preview */}
      <section className="section-padding bg-muted">
        <div className="container mx-auto">
          <SectionHeading title="Upcoming Events" subtitle="Join us for exclusive cigar nights, tastings, and social gatherings." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.title} className="bg-card rounded-lg border border-border overflow-hidden shadow-card hover:border-primary/30 transition-colors group">
                <div className="overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
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
      <section className="section-padding">
        <div className="container mx-auto text-center max-w-2xl">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-primary fill-primary" />
            ))}
          </div>
          <blockquote className="font-heading text-2xl md:text-3xl text-foreground italic mb-4">
            "Rated 5 stars by cigar enthusiasts in the Rio Grande Valley"
          </blockquote>
          <p className="text-muted-foreground text-sm">— Google Reviews</p>
        </div>
      </section>

      {/* Map / Location */}
      <section className="section-padding bg-muted">
        <div className="container mx-auto">
          <SectionHeading title="Find Us" subtitle="116 W State Ave, Pharr, TX 78577" />
          <div className="rounded-lg overflow-hidden border border-border shadow-card max-w-4xl mx-auto">
            <iframe
              title="Cigar Society US location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3588.123!2d-98.185!3d26.195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDExJzQyLjAiTiA5OMKwMTEnMDYuMCJX!5e0!3m2!1sen!2sus!4v1234567890"
              width="100%"
              height="400"
              style={{ border: 0 }}
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
