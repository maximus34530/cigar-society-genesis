import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import eventImg from "@/assets/event.jpg";

const events = [
  { title: "Friday Night Cigar Tasting", date: "Every Friday · 7:00 PM", description: "Sample hand-selected premium cigars from top brands. Our certified tobacconist guides you through flavor profiles and pairings.", image: eventImg },
  { title: "Big Game Watch Party", date: "Game Nights · Doors at 6:00 PM", description: "Enjoy the game with fellow aficionados. Premium cigars, big screens, and great company in a luxury setting.", image: eventImg },
  { title: "Cigar & Whiskey Pairing Social", date: "Last Saturday of the Month", description: "An exclusive evening pairing world-class cigars with fine whiskeys. Limited seating, members get priority.", image: eventImg },
  { title: "New Release Showcase", date: "Monthly · Check Social Media", description: "Be among the first to experience new and limited-edition cigar releases before they hit the shelves.", image: eventImg },
  { title: "Members-Only Mixer", date: "Quarterly", description: "An intimate gathering exclusively for La Sociedad members. Network, enjoy rare cigars, and celebrate the community.", image: eventImg },
];

const Events = () => (
  <Layout>
    <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
      <img src={eventImg} alt="Cigar Society events" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-background/75" />
      <div className="relative z-10 text-center px-4 animate-fade-in">
        <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground">Events</h1>
        <div className="gold-divider mt-6" />
      </div>
    </section>

    <section className="section-padding">
      <div className="container mx-auto">
        <SectionHeading title="Upcoming Events" subtitle="Join us for exclusive cigar nights, tastings, and social gatherings at Cigar Society US." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {events.map((event) => (
            <div key={event.title} className="bg-card rounded-lg border border-border overflow-hidden shadow-card hover:border-primary/30 transition-colors group">
              <div className="overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="p-6">
                <span className="text-xs font-body tracking-wider uppercase text-primary">{event.date}</span>
                <h3 className="font-heading text-xl font-semibold text-foreground mt-2 mb-3">{event.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default Events;
