import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import eventsHeroImg from "@/assets/gallery/events/641257260_17876872920513223_8406291060331286732_n.jpg";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { business } from "@/lib/business";
import { trackEvent } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

const reservationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
});

type ReservationValues = z.infer<typeof reservationSchema>;

const Events = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [reserving, setReserving] = useState(false);
  const [activeEvent, setActiveEvent] = useState<EventRow | null>(null);

  const form = useForm<ReservationValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  const n8nWebhookUrl = useMemo(() => {
    const raw = import.meta.env.VITE_N8N_EVENT_RESERVATION_WEBHOOK_URL as string | undefined;
    return raw?.trim() ? raw.trim() : null;
  }, []);

  const openReservation = (event: EventRow) => {
    if (!user) {
      navigate("/login", { replace: false, state: { from: "/events" } });
      return;
    }

    setActiveEvent(event);
    form.reset({
      name: profile?.full_name?.trim() ? profile.full_name : "",
      email: user.email ?? "",
      phone: "",
    });
  };

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
      <section
        ref={sectionRef}
        className="relative flex h-[50vh] items-center justify-center overflow-hidden border-b border-primary/25 bg-gradient-to-b from-background via-background to-muted/40"
      >
        <div
          ref={layerRef}
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 h-[118%] w-full min-h-full -top-[9%] min-w-full",
            !prefersReducedMotion && "will-change-transform",
          )}
          aria-hidden
        >
          <picture className="contents">
            <source srcSet={eventsHeroWebp} type="image/webp" />
            <img
              src={eventsHeroImg}
              alt=""
              className="h-full w-full min-h-full min-w-full object-cover object-center blur-[0.8px] scale-[1.02]"
              decoding="async"
              fetchPriority="high"
              loading="eager"
            />
          </picture>
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
        <div
          ref={fadeRef}
          className={cn("fade-in-scroll-target container mx-auto", fadeVisible && "is-visible")}
        >
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
                <Card
                  key={event.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openReservation(event)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") openReservation(event);
                  }}
                  className={cn(
                    "bg-card/40 border-border/60 overflow-hidden transition-colors",
                    "hover:border-primary/35 hover:bg-card/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
                  )}
                >
                  {event.image_path || event.image_url ? (
                    <div className="relative h-44 w-full shrink-0 overflow-hidden">
                      <img
                        src={
                          event.image_path
                            ? supabase.storage.from("event-images").getPublicUrl(event.image_path).data.publicUrl
                            : event.image_url ?? undefined
                        }
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="font-heading text-lg text-foreground">{event.name}</h2>
                    <p className="mt-1 font-body text-sm text-muted-foreground">
                      {event.date} • {event.time} {event.price != null ? `• $${event.price}` : ""}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {event.description ? (
                      <p className="font-body text-sm text-muted-foreground line-clamp-4">{event.description}</p>
                    ) : (
                      <p className="font-body text-sm text-muted-foreground">Details coming soon.</p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <p className="font-body text-xs text-muted-foreground">Click to reserve</p>
                      <span className="inline-flex items-center gap-1 text-xs font-body text-primary">
                        Reserve <ChevronRight className="h-4 w-4" aria-hidden />
                      </span>
                    </div>
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
            <p className="mt-6 max-w-full px-1 font-body text-sm text-muted-foreground break-words">
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

      <Dialog
        open={!!activeEvent}
        onOpenChange={(next) => {
          if (!next) {
            setActiveEvent(null);
            setReserving(false);
            form.reset({ name: "", email: "", phone: "" });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Reserve your spot</DialogTitle>
          </DialogHeader>

          {activeEvent ? (
            <div className="rounded-xl border border-border/60 bg-card/30 p-4">
              <p className="font-heading text-base text-foreground">{activeEvent.name}</p>
              <p className="mt-1 font-body text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-foreground/70" aria-hidden />
                  {activeEvent.date} • {activeEvent.time}
                </span>
              </p>
              <p className="mt-2 font-body text-xs text-muted-foreground/80">
                Ticket quantity: <span className="text-foreground/80">1</span>
              </p>
            </div>
          ) : null}

          <Form {...form}>
            <form
              className="mt-2 space-y-4"
              onSubmit={form.handleSubmit(async (values) => {
                if (!activeEvent || !user) return;
                setReserving(true);
                try {
                  const payload = {
                    user_id: user.id,
                    event_id: activeEvent.id,
                    name: values.name.trim(),
                    email: values.email.trim().toLowerCase(),
                    phone: values.phone.trim(),
                    tickets: 1,
                    total_paid: 0,
                  };

                  const { error: insertError } = await supabase.from("bookings").insert(payload);
                  if (insertError) throw insertError;

                  // Fire-and-forget: webhook should not block reservation UX
                  if (n8nWebhookUrl) {
                    fetch(n8nWebhookUrl, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        type: "event_reservation",
                        created_at: new Date().toISOString(),
                        user_id: user.id,
                        event: activeEvent,
                        reservation: { ...values, tickets: 1 },
                      }),
                    }).catch(() => {});
                  }

                  toast({
                    title: "Reserved — thank you!",
                    description: "Your reservation has been saved. You can manage it from your Dashboard.",
                  });

                  setActiveEvent(null);
                  navigate("/dashboard");
                } catch (e) {
                  form.setError("root", {
                    message: e instanceof Error ? e.message : "Could not reserve this event",
                  });
                } finally {
                  setReserving(false);
                }
              })}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-card border-border" autoComplete="name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" className="bg-card border-border" autoComplete="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" className="bg-card border-border" autoComplete="tel" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root?.message ? (
                <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
              ) : null}

              <DialogFooter className="mt-2 gap-2">
                <Button type="button" variant="outline" onClick={() => setActiveEvent(null)} disabled={reserving}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90" disabled={reserving}>
                  {reserving ? "Reserving…" : "Reserve"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Events;
