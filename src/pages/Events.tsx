import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { CalendarDays, ChevronRight, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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

function formatUsPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

const reservationSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .transform((v) => formatUsPhone(v))
    .refine((v) => v.replace(/\D/g, "").length === 10, "Enter a 10-digit phone number"),
  tickets: z.coerce.number().int().min(1, "Minimum 1 ticket").max(10, "Max 10 tickets"),
});

type ReservationValues = z.infer<typeof reservationSchema>;

type ReservationDraft = ReservationValues;

const Events = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [reserving, setReserving] = useState(false);
  const [activeEvent, setActiveEvent] = useState<EventRow | null>(null);
  const [step, setStep] = useState<"details" | "checkout">("details");
  const [reservationDraft, setReservationDraft] = useState<ReservationDraft | null>(null);
  const [paying, setPaying] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const form = useForm<ReservationValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", tickets: 1 },
  });

  const liveTickets = useWatch({ control: form.control, name: "tickets" });
  const ticketCountRaw = typeof liveTickets === "number" ? liveTickets : Number(liveTickets);
  const ticketCount = Number.isFinite(ticketCountRaw) ? Math.min(10, Math.max(1, Math.trunc(ticketCountRaw))) : 1;

  const n8nWebhookUrl = useMemo(() => {
    const raw = import.meta.env.VITE_N8N_EVENT_RESERVATION_WEBHOOK_URL as string | undefined;
    return raw?.trim() ? raw.trim() : null;
  }, []);

  const openReservation = (event: EventRow) => {
    if (!user) {
      const next = `/events?reserve=${encodeURIComponent(event.id)}`;
      navigate("/login", { replace: false, state: { from: next } });
      return;
    }

    setActiveEvent(event);
    setStep("details");
    setReservationDraft(null);
    setPaying(false);
    setBookingId(null);
    form.reset({
      firstName: profile?.full_name?.trim()?.split(" ")?.[0] ?? "",
      lastName: profile?.full_name?.trim()?.split(" ")?.slice(1).join(" ") ?? "",
      email: user.email ?? "",
      phone: "",
      tickets: 1,
    });
  };

  useEffect(() => {
    const reserveId = searchParams.get("reserve");
    if (!reserveId) return;
    if (!user) return;
    if (loading) return;

    const target = events.find((e) => e.id === reserveId);
    if (!target) return;

    // Clear the param so refresh doesn't reopen the modal.
    searchParams.delete("reserve");
    setSearchParams(searchParams, { replace: true });
    openReservation(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loading, events]);

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
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.225)] to-[rgba(0,0,0,0.275)]" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035] bg-[radial-gradient(ellipse_at_top,hsl(var(--gold)),transparent_55%)]"
          aria-hidden
        />
        <div className="relative z-10 animate-fade-in px-4 text-center max-w-[min(100%,40rem)] mx-auto">
          <h1 className="hero-heading-glow !font-heading font-bold text-foreground text-[clamp(1.85rem,5vw+0.5rem,3.75rem)] md:text-[clamp(2.5rem,4vw+1rem,3.75rem)]">
            Events
          </h1>
          <div className="gold-divider mt-6" />
        </div>
      </section>

      <section className="section-warm-radial section-padding border-y border-border/40 bg-muted/80">
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
                    <img
                      src={
                        event.image_path
                          ? supabase.storage.from("event-images").getPublicUrl(event.image_path).data.publicUrl
                          : event.image_url ?? undefined
                      }
                      alt=""
                      className="h-44 w-full max-w-full object-cover"
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

      <Dialog
        open={!!activeEvent}
        onOpenChange={(next) => {
          if (!next) {
            setActiveEvent(null);
            setReserving(false);
            setStep("details");
            setReservationDraft(null);
            setPaying(false);
            setBookingId(null);
            form.reset({ firstName: "", lastName: "", email: "", phone: "", tickets: 1 });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              {step === "details" ? "Reserve your spot" : "Secure checkout"}
            </DialogTitle>
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
                Ticket quantity:{" "}
                <span className="text-foreground/80">{reservationDraft?.tickets ?? ticketCount}</span>
              </p>
              <p className="mt-1 font-body text-xs text-muted-foreground/80">
                Total:{" "}
                <span className="text-foreground/80">
                  $
                  {activeEvent.price != null
                    ? (activeEvent.price * (reservationDraft?.tickets ?? ticketCount)).toFixed(2)
                    : 0}
                </span>
              </p>
            </div>
          ) : null}

          {step === "details" ? (
            <Form {...form}>
              <form
                className="mt-2 space-y-4"
                onSubmit={form.handleSubmit(async (values) => {
                  if (!activeEvent || !user) return;
                  setReserving(true);
                  try {
                    const unit = Number(activeEvent.price ?? 0);
                    const isFree = !Number.isFinite(unit) || unit <= 0;

                    const payload = {
                      user_id: user.id,
                      event_id: activeEvent.id,
                      name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
                      email: values.email.trim().toLowerCase(),
                      phone: values.phone.trim(),
                      tickets: values.tickets,
                      total_paid: 0,
                      status: isFree ? "paid" : "pending_payment",
                    };

                    const { data: inserted, error: insertError } = await supabase
                      .from("bookings")
                      .insert(payload)
                      .select("id")
                      .single();
                    if (insertError || !inserted?.id) throw insertError ?? new Error("Failed to create booking");

                    setBookingId(inserted.id as string);

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
                          reservation: values,
                        }),
                      }).catch(() => {});
                    }

                    if (isFree) {
                      toast({
                        title: "Reserved — thank you!",
                        description: "Your reservation has been confirmed. You can manage it from your Dashboard.",
                      });
                      setActiveEvent(null);
                      navigate("/dashboard?checkout=success");
                      return;
                    }

                    setReservationDraft(values);
                    setStep("checkout");
                  } catch (e) {
                    form.setError("root", {
                      message: e instanceof Error ? e.message : "Could not reserve this event",
                    });
                  } finally {
                    setReserving(false);
                  }
                })}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-card border-border" autoComplete="given-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-card border-border" autoComplete="family-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                        <Input
                          {...field}
                          type="tel"
                          inputMode="tel"
                          className="bg-card border-border"
                          autoComplete="tel"
                          onChange={(e) => {
                            field.onChange(formatUsPhone(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tickets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tickets</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={1}
                          max={10}
                          inputMode="numeric"
                          className="bg-card border-border"
                        />
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
                  <Button
                    type="submit"
                    className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90"
                    disabled={reserving}
                  >
                    {reserving ? "Saving…" : "Continue to payment"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : (
            <div className="mt-2 space-y-4">
              <div className="rounded-xl border border-border/60 bg-card/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-heading text-sm text-foreground">Checkout (demo)</p>
                    <p className="mt-1 font-body text-xs text-muted-foreground">
                      This is how Stripe Checkout will feel for users. No real payment is processed yet.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs font-body text-foreground/80">
                    <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                    Secure
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border/70"
                    disabled={paying}
                    onClick={async () => {
                      if (!bookingId) return;
                      setPaying(true);
                      try {
                        const { data, error } = await supabase.functions.invoke("create-checkout-session", {
                          body: { booking_id: bookingId },
                        });
                        if (error) throw error;
                        const url = (data as { checkout_url?: string; redirect_url?: string } | null)?.checkout_url ??
                          (data as { redirect_url?: string } | null)?.redirect_url;
                        if (!url) throw new Error("Missing checkout URL");
                        window.location.href = url;
                      } catch (e) {
                        toast({
                          title: "Couldn’t start checkout",
                          description: e instanceof Error ? e.message : "Please try again.",
                        });
                        setPaying(false);
                      }
                    }}
                  >
                    {paying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Apple Pay
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border/70"
                    disabled={paying}
                    onClick={async () => {
                      if (!bookingId) return;
                      setPaying(true);
                      try {
                        const { data, error } = await supabase.functions.invoke("create-checkout-session", {
                          body: { booking_id: bookingId },
                        });
                        if (error) throw error;
                        const url = (data as { checkout_url?: string; redirect_url?: string } | null)?.checkout_url ??
                          (data as { redirect_url?: string } | null)?.redirect_url;
                        if (!url) throw new Error("Missing checkout URL");
                        window.location.href = url;
                      } catch (e) {
                        toast({
                          title: "Couldn’t start checkout",
                          description: e instanceof Error ? e.message : "Please try again.",
                        });
                        setPaying(false);
                      }
                    }}
                  >
                    {paying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Google Pay
                  </Button>
                  <Button
                    type="button"
                    className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90"
                    disabled={paying}
                    onClick={async () => {
                      if (!bookingId) return;
                      setPaying(true);
                      try {
                        const { data, error } = await supabase.functions.invoke("create-checkout-session", {
                          body: { booking_id: bookingId },
                        });
                        if (error) throw error;
                        const url = (data as { checkout_url?: string; redirect_url?: string } | null)?.checkout_url ??
                          (data as { redirect_url?: string } | null)?.redirect_url;
                        if (!url) throw new Error("Missing checkout URL");
                        window.location.href = url;
                      } catch (e) {
                        toast({
                          title: "Couldn’t start checkout",
                          description: e instanceof Error ? e.message : "Please try again.",
                        });
                        setPaying(false);
                      }
                    }}
                  >
                    {paying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                    Pay with card
                  </Button>
                </div>

                <div className="mt-4 rounded-lg border border-border/60 bg-background/40 px-3 py-2">
                  <p className="font-body text-xs text-muted-foreground">
                    Paying as{" "}
                    <span className="text-foreground/80">
                      {reservationDraft?.email ?? user?.email ?? "user"}
                    </span>
                  </p>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("details")}
                  disabled={paying}
                  className="border-border/70"
                >
                  Back
                </Button>
                <Button type="button" variant="outline" className="border-border/70" onClick={() => setActiveEvent(null)} disabled={paying}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Events;
