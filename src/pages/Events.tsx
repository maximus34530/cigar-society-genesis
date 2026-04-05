import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import eventsHeroImg from "@/assets/gallery/events/641257260_17876872920513223_8406291060331286732_n.jpg";
import { business } from "@/lib/business";
import { trackEvent } from "@/lib/analytics";

const Events = () => (
  <Layout>
    <Seo
      title="Events — Live Music & Nights at the Lounge"
      description="Online events calendar coming soon for Cigar Society in Pharr, TX. Follow Instagram for comedy nights, live music, ladies nights, and more in the Rio Grande Valley."
      path="/events"
    />
    <section className="relative flex h-[50vh] items-center justify-center overflow-hidden border-b border-primary/25 bg-gradient-to-b from-background via-background to-muted/40">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <img
          src={eventsHeroImg}
          alt=""
          className="h-full w-full min-h-full min-w-full object-cover object-center blur-[0.8px] scale-[1.02]"
          decoding="async"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.45)] to-[rgba(0,0,0,0.55)]" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[radial-gradient(ellipse_at_top,hsl(var(--gold)),transparent_55%)]"
        aria-hidden
      />
      <div className="relative z-10 animate-fade-in px-4 text-center">
        <h1 className="!font-heading text-4xl font-bold text-foreground md:text-6xl">Events</h1>
        <div className="gold-divider mt-6" />
      </div>
    </section>

    <section className="section-padding border-y border-border/40 bg-muted/80">
      <div className="container mx-auto">
        <SectionHeading
          title="Live events calendar"
          subtitle={`Coming soon — see what's on at the lounge before you walk in the door. Until then, follow us on Instagram for comedy nights, live music, ladies nights, game nights, and more — or stop by and call for what's happening this week.`}
        />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[0, 1, 2].map((slot) => (
            <div
              key={slot}
              className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/30 px-6 py-10 text-center ring-1 ring-border/20 md:min-h-[260px]"
              aria-hidden={slot !== 0}
            >
              <p className="font-heading text-lg font-semibold tracking-wide text-muted-foreground/90 md:text-xl">
                Coming soon
              </p>
              <p className="mt-3 max-w-[14rem] font-body text-sm leading-relaxed text-muted-foreground/70">
                Event listings will appear here when we launch.
              </p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button
            asChild
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <a
              href={business.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("Events CTA", { location: "events-calendar-soon" })}
            >
              Follow for upcoming events
            </a>
          </Button>
          <p className="mt-6 font-body text-sm text-muted-foreground">
            Prefer the phone?{" "}
            <Link
              to="/contact"
              className="font-medium text-primary underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary/90"
            >
              Contact us
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  </Layout>
);

export default Events;
