import { Link } from "react-router-dom";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeUp } from "@/components/FadeUp";
import { GoldAccentShimmer } from "@/components/GoldAccentShimmer";
import { ScrollParallaxLayer } from "@/components/ScrollParallaxLayer";
import { supabase } from "@/lib/supabase";
import { CalendarDays, ChevronRight, MapPin, Star, Ticket } from "lucide-react";
import liveEventsImg from "@/assets/gallery/events/641257260_17876872920513223_8406291060331286732_n.jpg";
import spiritsBarImg from "@/assets/spirits-bar.png";
import communityHospitalityImg from "@/assets/community-hospitality.png";
import {
  HOME_FEATURED_EVENT_IMAGE_FRAME,
  HOME_FEATURED_EVENT_IMAGE_IMG,
  eventImageObjectStyle,
  isMissingEventsImageObjectPositionError,
} from "@/lib/eventImagePosition";
import { business } from "@/lib/business";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { useEffect, useMemo, useState } from "react";

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
  "h-auto min-h-[3rem] rounded-full px-8 py-3.5 font-body text-sm font-medium uppercase tracking-wide sm:w-auto sm:min-w-[11rem] transition-[color,box-shadow,border-color,background-color,transform,filter] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]";

const heroPrimaryCta = cn(heroCtaBase);

const heroSecondaryCta = cn(
  heroCtaBase,
  "!border-2 !border-primary/60 !bg-background/35 !text-primary backdrop-blur-sm hover:!border-primary hover:!bg-primary/10 hover:!text-primary",
);

const experienceEase = [0.16, 1, 0.3, 1] as const;

const experienceParent: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.14, delayChildren: 0.06 },
  },
};

const experienceChild: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.88, ease: experienceEase },
  },
};

const headlineEase = [0.16, 1, 0.3, 1] as const;

type HomeEventPreview = {
  id: string;
  name: string;
  date: string;
  time: string;
  capacity_total: number | null;
  description: string | null;
  image_url: string | null;
  image_path: string | null;
  image_object_position: string | null;
};

function soldForEvent(soldByEvent: Record<string, number>, eventId: string) {
  return soldByEvent[eventId] ?? 0;
}

function spotsRemaining(event: HomeEventPreview, sold: number): number | null {
  if (event.capacity_total == null) return null;
  const cap = Number(event.capacity_total);
  if (!Number.isFinite(cap) || cap <= 0) return null;
  return Math.max(0, cap - sold);
}

const Index = () => {
  const heroVideoPath = business.homeV2VideoPaths[0] ?? "";
  const reduceMotion = useReducedMotion();
  const brandWords = business.shortName.split(/\s+/).filter(Boolean);
  const [events, setEvents] = useState<HomeEventPreview[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [soldByEvent, setSoldByEvent] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    const loadHomeEvents = async () => {
      setEventsLoading(true);

      try {
        const selectWithFocal =
          "id,name,date,time,capacity_total,description,image_url,image_path,image_object_position";
        const selectLegacy = "id,name,date,time,capacity_total,description,image_url,image_path";

        let { data, error } = await supabase
          .from("events")
          .select(selectWithFocal)
          .eq("is_active", true)
          .is("deleted_at", null)
          .order("date", { ascending: true })
          .order("time", { ascending: true })
          .limit(3);
        if (cancelled) return;
        if (error && isMissingEventsImageObjectPositionError(error)) {
          ({ data, error } = await supabase
            .from("events")
            .select(selectLegacy)
            .eq("is_active", true)
            .is("deleted_at", null)
            .order("date", { ascending: true })
            .order("time", { ascending: true })
            .limit(3));
        }
        if (cancelled) return;
        if (error) throw error;
        const rows = (
          (data as (HomeEventPreview | Omit<HomeEventPreview, "image_object_position">)[] | null) ?? []
        ).map((r) => ("image_object_position" in r ? r : { ...r, image_object_position: null as string | null }));
        const sliced = rows.slice(0, 3) as HomeEventPreview[];
        if (!cancelled) setEvents(sliced);

        const ids = sliced.map((r) => r.id);
        if (ids.length === 0) return;
        try {
          const { data: soldRows, error: rpcErr } = await supabase.rpc("event_tickets_sold_batch", {
            p_event_ids: ids,
          });
          if (rpcErr) throw rpcErr;
          const map: Record<string, number> = {};
          for (const row of (soldRows as { event_id: string; tickets_sold: number }[] | null) ?? []) {
            map[row.event_id] = row.tickets_sold;
          }
          if (!cancelled) setSoldByEvent(map);
        } catch {
          if (!cancelled) setSoldByEvent({});
        }
      } catch {
        if (!cancelled) {
          setEvents([]);
          setSoldByEvent({});
        }
      } finally {
        if (!cancelled) setEventsLoading(false);
      }
    };

    void loadHomeEvents();

    let refetchDebounce: ReturnType<typeof setTimeout> | undefined;

    const scheduleRefetch = () => {
      window.clearTimeout(refetchDebounce);
      refetchDebounce = window.setTimeout(() => {
        if (!cancelled) void loadHomeEvents();
      }, 400);
    };

    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      scheduleRefetch();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onWindowFocus = () => scheduleRefetch();
    window.addEventListener("focus", onWindowFocus);

    return () => {
      cancelled = true;
      window.clearTimeout(refetchDebounce);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onWindowFocus);
    };
  }, []);

  const eventsEmpty = useMemo(() => !eventsLoading && events.length === 0, [eventsLoading, events.length]);
  const featured = events[0] ?? null;
  const secondary = events.slice(1, 3);
  const homeHeroBuyTicketsTo = featured
    ? `/events?reserve=${encodeURIComponent(featured.id)}`
    : "/events";

  return (
    <Layout>
      <Seo title="Cigar Society — Premium Cigar Lounge in Pharr, TX" description={HOME_DESCRIPTION} path="/" />
      <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
        <ScrollParallaxLayer
          speed={0.3}
          className="absolute inset-0 z-0 min-h-[110%] min-w-full"
        >
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
        </ScrollParallaxLayer>
        <div className="absolute inset-0 hero-overlay" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 pb-12 text-center sm:pb-16">
          <h1 className="hero-heading-glow !font-heading font-bold tracking-tight text-balance text-foreground drop-shadow-[0_2px_24px_hsl(0_0%_0%_/_0.35)] mb-6 text-[clamp(1.85rem,6vw+0.25rem,4.5rem)] sm:text-[clamp(2.25rem,5vw+0.5rem,3.75rem)] md:text-[clamp(3rem,4vw+1rem,4.5rem)]">
            {reduceMotion ? (
              <>
                Welcome to <span className="text-gold-gradient">{business.shortName}</span>
              </>
            ) : (
              <>
                {["Welcome", "to", ...brandWords].map((word, i) => (
                  <motion.span
                    key={`${word}-${i}`}
                    className="inline-block mr-[0.28em] last:mr-0"
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: i * 0.12, ease: headlineEase }}
                  >
                    {i >= 2 ? <GoldAccentShimmer>{word}</GoldAccentShimmer> : word}
                  </motion.span>
                ))}
              </>
            )}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-foreground/85 font-body md:text-lg">
            A premium cigar lounge and bar experience in the Rio Grande Valley.
          </p>
          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <Button asChild variant="luxury" size="lg" className={heroPrimaryCta}>
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
              <Link
                to={homeHeroBuyTicketsTo}
                onClick={() =>
                  trackEvent("Buy Tickets", {
                    location: "home-hero",
                    ...(featured ? { event_id: featured.id } : {}),
                  })
                }
              >
                <Ticket className="size-4 opacity-90" aria-hidden />
                Buy Tickets
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-border/30 bg-background section-padding">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_95%_65%_at_50%_18%,hsl(var(--gold)/0.05),transparent_58%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_130%_90%_at_50%_100%,hsl(38_42%_28%/0.045),transparent_60%)]"
        />
        <div aria-hidden className="experience-grain absolute inset-0 opacity-[0.04]" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,hsl(0_0%_0%/0.55)_100%)]"
        />

        <motion.div
          className="container relative z-10 mx-auto max-w-4xl text-center"
          variants={experienceParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.22 }}
        >
          <motion.div variants={experienceChild}>
            <SectionHeading title="The Experience" />
          </motion.div>
          <motion.div variants={experienceChild} className="mx-auto max-w-3xl space-y-5 text-left sm:text-center">
            <p className="font-body text-lg font-medium leading-relaxed text-primary md:text-xl">
              We opened in 2025 to bring something different to the Rio Grande Valley—a place where quality, comfort, and
              community come together.
            </p>
            <p className="text-muted-foreground font-body text-base leading-relaxed md:text-lg">
              With live events, a full bar, and a lounge built for conversation, it&apos;s a space to unwind, connect, and
              enjoy a proper smoke.
            </p>
            <p className="text-muted-foreground font-body text-base leading-relaxed md:text-lg">
              Whether it&apos;s your first cigar or your hundredth, pull up a seat, pick your smoke, and stay a while.
            </p>
          </motion.div>
          <motion.div variants={experienceChild} className="mt-10 flex justify-center sm:mt-12">
            <Button
              asChild
              variant="luxury"
              size="lg"
              className="min-w-[12rem] rounded-md px-8 font-body text-sm font-medium uppercase tracking-wider"
            >
              <Link to="/about">Our story →</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <section className="section-padding bg-background">
        <FadeUp>
          <div className="container mx-auto">
            <SectionHeading
              title="Inside the lounge"
              subtitle="Comfort, quality, and a warm welcome—every time you walk through the door."
            />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="premium-card-hover group rounded-xl border border-border/70 bg-card shadow-card transition-transform duration-500 ease-out hover:scale-[1.04] overflow-hidden"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                    <img
                      src={item.image}
                      alt={item.alt}
                      className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      decoding="async"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading mb-2 text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button asChild variant="link" className="text-primary font-body text-sm uppercase tracking-wider">
                <Link to="/gallery">View the gallery →</Link>
              </Button>
            </div>
          </div>
        </FadeUp>
      </section>

      <section className="section-warm-radial section-padding border-y border-border/40 bg-muted/80">
        <FadeUp>
          <div className="container mx-auto">
            <SectionHeading
              title="Live events at the lounge"
              subtitle="Live music, comedy nights, and special events in the Rio Grande Valley."
              className="!mb-10 md:!mb-12"
            />

            {eventsLoading ? (
              <p className="font-body text-sm text-muted-foreground">Loading events…</p>
            ) : eventsEmpty ? (
              <div className="rounded-xl border border-dashed border-border/60 bg-card/30 px-6 py-10 text-center">
                <p className="font-heading text-lg font-semibold tracking-wide text-muted-foreground/90 md:text-xl">
                  No upcoming events posted yet
                </p>
                <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground/70">
                  Check back soon, or follow us on Instagram for announcements.
                </p>
                <div className="mt-6">
                  <Button
                    asChild
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <a href={business.instagramUrl} target="_blank" rel="noopener noreferrer">
                      Follow for updates
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border/50 bg-card/30 p-4 sm:p-6">
                <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                  <Card className="overflow-hidden rounded-2xl border-border/60 bg-card/40 shadow-card">
                    {(() => {
                      const imageSrc =
                        featured?.image_path || featured?.image_url
                          ? featured?.image_path
                            ? supabase.storage.from("event-images").getPublicUrl(featured.image_path).data.publicUrl
                            : featured?.image_url ?? undefined
                          : liveEventsImg;
                      const focalKey = featured?.image_object_position ?? "default";
                      return (
                        <div className={cn(HOME_FEATURED_EVENT_IMAGE_FRAME, "rounded-t-2xl")}>
                          <img
                            key={`${featured?.id ?? "hero"}-${focalKey}`}
                            src={imageSrc}
                            alt=""
                            className={HOME_FEATURED_EVENT_IMAGE_IMG}
                            style={eventImageObjectStyle(featured?.image_object_position ?? null)}
                            loading="lazy"
                            decoding="async"
                          />
                          <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"
                          />
                        </div>
                      );
                    })()}
                    <CardHeader className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-primary/15 text-primary border border-primary/25 font-body text-[10px] uppercase tracking-wide">
                          Next up
                        </Badge>
                        <Badge variant="outline" className="border-border/70 font-body text-[10px] uppercase tracking-wide">
                          21+
                        </Badge>
                      </div>
                      <CardTitle className="font-heading text-2xl">{featured?.name ?? "Upcoming event"}</CardTitle>
                      <div className="grid gap-1 font-body text-sm text-muted-foreground">
                        <p className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-foreground/70" aria-hidden />
                          {featured ? `${featured.date} • ${featured.time}` : "Dates announced soon"}
                        </p>
                        <p className="inline-flex items-start gap-2">
                          <MapPin className="mt-[2px] h-4 w-4 text-foreground/70" aria-hidden />
                          {business.address}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="font-body text-sm leading-relaxed text-muted-foreground line-clamp-4">
                        {featured?.description?.trim()
                          ? featured.description
                          : "Great nights, great cigars, and a relaxed lounge built for conversation."}
                      </p>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-body text-xs text-muted-foreground/80">
                          All ticket sales are final and non-refundable.{" "}
                          <Link to="/terms" className="text-primary underline underline-offset-2 hover:text-primary/90">
                            Event ticket terms
                          </Link>
                        </p>
                        <Button
                          asChild
                          className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90"
                          onClick={() => trackEvent("Home Events Featured Get Tickets", { event_id: featured?.id ?? "unknown" })}
                        >
                          <Link to={featured ? `/events?reserve=${encodeURIComponent(featured.id)}` : "/events"}>
                            Get tickets <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-3">
                    <p className="font-heading text-sm text-foreground/80">Also coming up</p>
                    {secondary.map((e) => {
                      const sold = soldForEvent(soldByEvent, e.id);
                      const remaining = spotsRemaining(e, sold);
                      const subtleLink = `/events?reserve=${encodeURIComponent(e.id)}`;
                      const desc = (e.description ?? "").trim();
                      const descLower = desc.toLowerCase();
                      const safeDesc = !desc ? "Details coming soon." : descLower === "free event" ? "Details coming soon." : desc;

                      return (
                        <Card key={e.id} className="border-border/60 bg-card/20">
                          <CardHeader className="space-y-2">
                            <CardTitle className="font-heading text-base">{e.name}</CardTitle>
                            <p className="font-body text-xs text-muted-foreground">
                              {e.date} • {e.time}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="border-border/70 font-body text-[10px] uppercase tracking-wide">
                                21+
                              </Badge>
                              {remaining != null ? (
                                <Badge variant="secondary" className="font-body text-[10px]">
                                  {remaining} spots left
                                </Badge>
                              ) : null}
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="font-body text-sm leading-relaxed text-muted-foreground line-clamp-3">{safeDesc}</p>
                            <div className="mt-3">
                              <Button
                                asChild
                                variant="link"
                                className="h-auto p-0 font-body text-xs uppercase tracking-wider text-primary underline underline-offset-4 hover:text-primary/90"
                                onClick={() => trackEvent("Home Events Upcoming CTA", { event_id: e.id })}
                              >
                                <Link to={subtleLink}>View details →</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      <Link to="/events" onClick={() => trackEvent("Home Events View All", { variant: "footer" })}>
                        View full calendar <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </FadeUp>
      </section>

      <section className="section-padding border-y border-border/40 bg-muted/80">
        <FadeUp>
          <div className="container mx-auto">
            <SectionHeading
              title="Cigar marketplace"
              subtitle={`Coming soon — browse and shop highlighted picks from our humidor online. Until then, explore our in-store menu or stop by and call for today's lineup.`}
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
                    In the meantime, explore our in-lounge selection
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button asChild variant="luxury" className="font-body text-sm uppercase tracking-wider">
                <Link to="/cigars" onClick={() => trackEvent("Marketplace CTA", { location: "home-marketplace-soon" })}>
                  Browse our cigar menu
                </Link>
              </Button>
            </div>
          </div>
        </FadeUp>
      </section>

      <section className="section-padding overflow-hidden">
        <FadeUp>
          <div className="container mx-auto mb-10 text-center">
            <div className="mb-2 flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Google Reviews · 5.0 Stars</p>
          </div>
        </FadeUp>

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
                className="mx-3 w-72 flex-shrink-0 rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="mb-3 flex gap-0.5">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mb-4 line-clamp-4 text-sm leading-relaxed text-foreground">&quot;{r.text}&quot;</p>
                <p className="text-xs font-medium text-muted-foreground">— {r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section-padding scroll-mt-24 border-t border-border/40 bg-muted/40">
        <FadeUp>
          <div className="container mx-auto max-w-3xl">
            <SectionHeading
              title="Common questions"
              subtitle="Quick answers before you visit. For anything else, call us or stop by during business hours."
            />
            <div className="space-y-10 text-left">
              <div>
                <h3 className="font-heading mb-3 text-xl font-semibold text-foreground">What are your hours?</h3>
                <p className="font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
                  We&apos;re open {business.hoursText}. Holiday hours can differ—call {business.phoneDisplay} if you want
                  to double-check before you head over.
                </p>
              </div>
              <div>
                <h3 className="font-heading mb-3 text-xl font-semibold text-foreground">Is there an age requirement?</h3>
                <p className="font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Yes. Cigar Society is <span className="text-foreground/90">21+ to enter</span>, consistent with our
                  lounge policies. Please bring a valid government-issued ID.
                </p>
              </div>
              <div>
                <h3 className="font-heading mb-3 text-xl font-semibold text-foreground">Do you allow BYOB?</h3>
                <p className="font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
                  We serve bourbon, beer, and mixed drinks at the bar. Outside bottles and BYOB rules can change with
                  events and staffing—call {business.phoneDisplay} before your visit and our team will share the current
                  policy.
                </p>
              </div>
              <div>
                <h3 className="font-heading mb-3 text-xl font-semibold text-foreground">Do you host private events?</h3>
                <p className="font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
                  We&apos;re happy to talk through private events, celebrations, and group visits. Reach us at{" "}
                  <a href={`tel:${business.phoneE164}`} className="text-primary underline-offset-4 hover:underline">
                    {business.phoneDisplay}
                  </a>{" "}
                  or visit during business hours so we can help with availability and details.
                </p>
              </div>
              <div>
                <h3 className="font-heading mb-3 text-xl font-semibold text-foreground">
                  Where are you located, and is there parking?
                </h3>
                <p className="font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
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
            <p className="mt-12 text-center font-body text-sm text-muted-foreground">
              More ways to reach us:{" "}
              <Link to="/contact" className="text-primary underline-offset-4 hover:underline">
                Contact
              </Link>
              .
            </p>
          </div>
        </FadeUp>
      </section>

      <section id="find-us" className="section-padding scroll-mt-24 bg-muted">
        <FadeUp>
          <div className="container mx-auto">
            <SectionHeading title="Find Us" subtitle={business.address} className="!mb-8 md:!mb-10" />
            <div className="mb-8 flex flex-wrap items-center justify-center gap-3 md:mb-10">
              <Button asChild variant="luxury">
                <a
                  href={business.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("Visit the Lounge", { location: "find-us", target: "google-maps" })}
                >
                  Google Maps
                </a>
              </Button>
              <Button asChild variant="luxury">
                <a
                  href={business.appleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("Directions", { location: "find-us", target: "apple-maps" })}
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
        </FadeUp>
      </section>
    </Layout>
  );
};

export default Index;
