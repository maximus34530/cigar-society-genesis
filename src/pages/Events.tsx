import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import eventsHeroImg from "@/assets/gallery/events/641257260_17876872920513223_8406291060331286732_n.jpg";
import { business } from "@/lib/business";
import { trackEvent } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type EventRow = {
  id: string;
  name: string;
  date: string;
  time: string;
  price: number | null;
  description: string | null;
  image_url: string | null;
  image_path: string | null;
};

const Events = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { data, error: err } = await supabase
          .from("events")
          .select("id,name,date,time,price,description,image_url,image_path")
          .eq("is_active", true)
          .is("deleted_at", null)
          .order("date", { ascending: true })
          .order("time", { ascending: true });

        if (err) throw err;
        if (!cancelled) setEvents((data as EventRow[]) ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load events");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Layout>
      <Seo
        title="Events — Live Music & Nights at the Lounge"
        description="See what’s happening at Cigar Society in Pharr, TX — live music, comedy nights, and more in the Rio Grande Valley."
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
            subtitle="See what’s on at the lounge. For last-minute updates, follow us on Instagram."
          />

          {loading ? (
            <p className="font-body text-sm text-muted-foreground">Loading events…</p>
          ) : error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
              <p className="font-body text-sm text-destructive">Couldn’t load events: {error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-card/30 px-6 py-10 text-center">
              <p className="font-heading text-lg font-semibold tracking-wide text-muted-foreground/90 md:text-xl">
                No upcoming events posted yet
              </p>
              <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground/70">
                Check back soon, or follow us on Instagram for announcements.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {events.map((event) => (
                <Card key={event.id} className="bg-card/40 border-border/60 overflow-hidden">
                  {event.image_path || event.image_url ? (
                    <img
                      src={
                        event.image_path
                          ? supabase.storage.from("event-images").getPublicUrl(event.image_path).data.publicUrl
                          : event.image_url ?? undefined
                      }
                      alt=""
                      className="h-44 w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                  <CardHeader>
                    <CardTitle className="font-heading text-lg">{event.name}</CardTitle>
                    <p className="font-body text-sm text-muted-foreground">
                      {event.date} • {event.time} {event.price != null ? `• $${event.price}` : ""}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {event.description ? (
                      <p className="font-body text-sm text-muted-foreground line-clamp-4">{event.description}</p>
                    ) : (
                      <p className="font-body text-sm text-muted-foreground">Details coming soon.</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

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
                onClick={() => trackEvent("Events CTA", { location: "events-calendar" })}
              >
                Follow for updates
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
};

export default Events;
