import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Lock, Calendar, Gift, Armchair, Crown, Users } from "lucide-react";
import heroImg from "@/assets/hero-lounge.jpg";

const benefits = [
  { icon: Lock, title: "Private Locker Storage", desc: "Your own personal humidor locker to store and age your favorite cigars in our climate-controlled facility." },
  { icon: Calendar, title: "Exclusive Events", desc: "Access members-only tastings, pairings, and social gatherings throughout the year." },
  { icon: Gift, title: "Member Cigar Drops", desc: "Receive curated cigar selections and limited-edition drops exclusively for members." },
  { icon: Armchair, title: "Priority Seating", desc: "Enjoy reserved premium seating during peak hours and special events." },
  { icon: Crown, title: "Lounge Discounts", desc: "Exclusive member pricing on cigars, accessories, and lounge amenities." },
  { icon: Users, title: "Community", desc: "Join a brotherhood of cigar enthusiasts who share your passion for the finer things." },
];

const Membership = () => (
  <Layout>
    <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
      <img src={heroImg} alt="La Sociedad Membership" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-background/80" />
      <div className="relative z-10 text-center px-4 animate-fade-in">
        <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground">La Sociedad</h1>
        <p className="text-muted-foreground mt-4 text-lg">Exclusive Membership</p>
        <div className="gold-divider mt-6" />
      </div>
    </section>

    <section className="section-padding">
      <div className="container mx-auto">
        <SectionHeading title="Member Benefits" subtitle="Elevate your cigar experience with La Sociedad membership perks." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-lg p-8 shadow-card hover:border-primary/30 transition-colors text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-3">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="section-padding bg-muted">
      <div className="container mx-auto text-center max-w-2xl">
        <SectionHeading title="Ready to Join?" subtitle="Become part of an exclusive community of cigar aficionados in the Rio Grande Valley." />
        <Button asChild size="lg" className="bg-gold-gradient text-primary-foreground font-body tracking-wider uppercase text-sm px-8 py-6 shadow-gold hover:opacity-90">
          <Link to="/contact">Inquire About Membership</Link>
        </Button>
      </div>
    </section>
  </Layout>
);

export default Membership;
