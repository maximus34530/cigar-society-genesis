import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import eventsHeroImg from "@/assets/gallery/events/641257260_17876872920513223_8406291060331286732_n.jpg";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { business } from "@/lib/business";
import { createCheckoutSessionUrl } from "@/lib/checkout";
import { trackEvent } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, ChevronDown, ChevronRight, Loader2, MapPin } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

type EventRow = {
  id: string;
  name: string;
  date: string;
  time: string;
  price: number | null;
  capacity_total: number | null;
  description: string | null;
  image_url: string | null;
  image_path: string | null;
};

type CheckoutStep = "tickets" | "details" | "pay";

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

function soldForEvent(soldByEvent: Record<string, number>, eventId: string) {
  return soldByEvent[eventId] ?? 0;
}

function spotsRemaining(event: EventRow, sold: number): number | null {
  if (event.capacity_total == null) return null;
  const cap = Number(event.capacity_total);
  if (!Number.isFinite(cap) || cap <= 0) return null;
  return Math.max(0, cap - sold);
}

function isSoldOut(event: EventRow, sold: number) {
  const r = spotsRemaining(event, sold);
  return r !== null && r <= 0;
}

const Events = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [soldByEvent, setSoldByEvent] = useState<Record<string, number>>({});
  const [reserving, setReserving] = useState(false);
  const [activeEvent, setActiveEvent] = useState<EventRow | null>(null);
  const [step, setStep] = useState<CheckoutStep>("tickets");
  const [paying, setPaying] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : true,
  );

  const form = useForm<ReservationValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", tickets: 1 },
  });

  const liveTickets = useWatch({ control: form.control, name: "tickets" });
  const ticketCountRaw = typeof liveTickets === "number" ? liveTickets : Number(liveTickets);
  const ticketCount = Number.isFinite(ticketCountRaw) ? Math.min(10, Math.max(1, Math.trunc(ticketCountRaw))) : 1;

  /** Free events only: paid tickets use server `N8N_RECEIPT_WEBHOOK_URL` after Stripe (no client ping before payment). */
  const n8nFreeEventWebhookUrl = useMemo(() => {
    const raw = import.meta.env.VITE_N8N_EVENT_RESERVATION_WEBHOOK_URL as string | undefined;
    return raw?.trim() ? raw.trim() : null;
  }, []);

  const unitPrice = activeEvent ? Number(activeEvent.price ?? 0) : 0;
  const isFree = !Number.isFinite(unitPrice) || unitPrice <= 0;

  const openReservation = useCallback(
    (event: EventRow) => {
      if (!user) {
        const next = `/events?reserve=${encodeURIComponent(event.id)}`;
        navigate("/login", { replace: false, state: { from: next } });
        return;
      }

      const sold = soldForEvent(soldByEvent, event.id);
      if (isSoldOut(event, sold)) {
        toast({
          title: "Sold out",
          description: "This event has reached capacity. Follow us for the next night.",
        });
        return;
      }

      setActiveEvent(event);
      setStep("tickets");
      setPaying(false);
      form.reset({
        firstName: profile?.full_name?.trim()?.split(" ")?.[0] ?? "",
        lastName: profile?.full_name?.trim()?.split(" ")?.slice(1).join(" ") ?? "",
        email: user.email ?? "",
        phone: "",
        tickets: 1,
      });
    },
    [user, navigate, soldByEvent, profile, form],
  );

  useEffect(() => {
    const reserveId = searchParams.get("reserve");
    if (!reserveId) return;
    if (!user) return;
    if (loading) return;

    const target = events.find((e) => e.id === reserveId);
    if (!target) return;

    openReservation(target);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("reserve");
        return next;
      },
      { replace: true },
    );
  }, [user, loading, events, searchParams, setSearchParams, openReservation]);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    const eventId = searchParams.get("event_id");
    if (checkout !== "cancelled" || !eventId) return;

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("checkout");
        next.delete("event_id");
        return next;
      },
      { replace: true },
    );

    toast({
      title: "Checkout cancelled",
      description: "Your reservation is saved but unpaid. Complete payment anytime from your Dashboard.",
    });

    requestAnimationFrame(() => {
      document.getElementById(`event-card-${eventId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { data, error: err } = await supabase
          .from("events")
          .select("id,name,date,time,price,capacity_total,description,image_url,image_path")
          .eq("is_active", true)
          .is("deleted_at", null)
          .order("date", { ascending: true })
          .order("time", { ascending: true });

        if (err) throw err;
        const rows = (data as EventRow[]) ?? [];
        if (!cancelled) setEvents(rows);

        const ids = rows.map((r) => r.id);
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

  const stepTitle = (s: CheckoutStep) => {
    if (s === "tickets") return "Tickets";
    if (s === "details") return "Your details";
    return "Review & pay";
  };

  const orderSummary = activeEvent ? (
    <div className="space-y-3 rounded-xl border border-border/60 bg-card/30 p-4">
      <p className="font-heading text-sm text-foreground">Order summary</p>
      <div>
        <p className="font-heading text-sm text-foreground">{activeEvent.name}</p>
        <p className="mt-1 font-body text-xs text-muted-foreground">
          {activeEvent.date} • {activeEvent.time}
        </p>
        <p className="mt-2 font-body text-xs text-muted-foreground">
          {business.publicVenueName} — {business.address}
        </p>
      </div>
      <div className="border-t border-border/60 pt-3 font-body text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Tickets × {ticketCount}</span>
          <span className="text-foreground/90">
            {activeEvent.price != null ? `$${(activeEvent.price * ticketCount).toFixed(2)}` : "—"}
          </span>
        </div>
        {!isFree ? (
          <p className="mt-2 text-xs text-muted-foreground">Fees included in ticket price.</p>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">No ticket charge for this event.</p>
        )}
      </div>
    </div>
  ) : null;

  const stepIndicator = (
    <div className="flex flex-wrap items-center gap-2 font-body text-xs text-muted-foreground">
      {(["tickets", "details", "pay"] as const).map((s, i) => (
        <span key={s} className="inline-flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5",
              step === s ? "bg-primary/15 text-primary" : "bg-muted/40 text-muted-foreground",
            )}
          >
            {i + 1}. {stepTitle(s)}
          </span>
          {i < 2 ? <span aria-hidden>→</span> : null}
        </span>
      ))}
    </div>
  );

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
              {events.map((event) => {
                const sold = soldForEvent(soldByEvent, event.id);
                const remaining = spotsRemaining(event, sold);
                const soldOut = isSoldOut(event, sold);
                return (
                  <Card
                    key={event.id}
                    id={`event-card-${event.id}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => openReservation(event)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") openReservation(event);
                    }}
                    className={cn(
                      "bg-card/40 border-border/60 overflow-hidden transition-colors",
                      soldOut
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:border-primary/35 hover:bg-card/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
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
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-4 w-4 shrink-0 text-foreground/70" aria-hidden />
                          {event.date} • {event.time}
                        </span>
                        {event.price != null ? ` • $${event.price} per ticket` : ""}
                      </p>
                      <p className="mt-2 flex flex-wrap items-center gap-2 font-body text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          {business.address}
                        </span>
                        <Badge variant="outline" className="border-border/70 text-[10px] uppercase tracking-wide">
                          21+
                        </Badge>
                        {remaining != null ? (
                          <Badge variant={soldOut ? "destructive" : "secondary"} className="text-[10px]">
                            {soldOut ? "Sold out" : `${remaining} spots left`}
                          </Badge>
                        ) : null}
                      </p>
                    </CardHeader>
                    <CardContent>
                      {event.description ? (
                        <p className="font-body text-sm text-muted-foreground line-clamp-4">{event.description}</p>
                      ) : (
                        <p className="font-body text-sm text-muted-foreground">Details coming soon.</p>
                      )}

                      <p className="mt-3 font-body text-[11px] text-muted-foreground/80">
                        <Link to="/terms" className="text-primary underline underline-offset-2 hover:text-primary/90">
                          Event & refund terms
                        </Link>
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <p className="font-body text-xs text-muted-foreground">{soldOut ? "Unavailable" : "Reserve"}</p>
                        <span className="inline-flex items-center gap-1 text-xs font-body text-primary">
                          {soldOut ? "Sold out" : "Reserve"}{" "}
                          {!soldOut ? <ChevronRight className="h-4 w-4" aria-hidden /> : null}
                        </span>
              </div>
                    </CardContent>
                  </Card>
                );
              })}
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
            setStep("tickets");
            setPaying(false);
            form.reset({ firstName: "", lastName: "", email: "", phone: "", tickets: 1 });
          }
        }}
      >
        <DialogContent
          className={cn(
            "flex max-h-[min(92vh,880px)] w-[calc(100vw-1.25rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl lg:max-w-4xl",
          )}
        >
          <div className="max-h-[min(92vh,880px)] overflow-y-auto p-4 sm:p-6">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="font-heading">
                {activeEvent ? `Reserve — ${activeEvent.name}` : "Reserve"}
              </DialogTitle>
              {activeEvent ? (
                <div className="rounded-xl border border-border/60 bg-card/30 p-3">
                  <p className="font-heading text-sm text-foreground">{activeEvent.name}</p>
                  <p className="mt-1 font-body text-xs text-muted-foreground">
                    <CalendarDays className="mr-1 inline h-3.5 w-3.5 text-foreground/70" aria-hidden />
                    {activeEvent.date} • {activeEvent.time}
                  </p>
                </div>
              ) : null}
              {stepIndicator}
            </DialogHeader>

            <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_280px] lg:gap-8">
              <div className="min-w-0 space-y-4">
                {step === "tickets" && activeEvent ? (
                  <Form {...form}>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="tickets"
                        render={({ field }) => {
                          const sold = soldForEvent(soldByEvent, activeEvent.id);
                          const rem = spotsRemaining(activeEvent, sold);
                          const maxTickets = rem != null ? Math.min(10, Math.max(1, rem)) : 10;
                          return (
                            <FormItem>
                              <FormLabel>How many tickets?</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min={1}
                                  max={maxTickets}
                                  inputMode="numeric"
                                  className="bg-card border-border"
                                  onChange={(e) => {
                                    const n = Number(e.target.value);
                                    field.onChange(Number.isFinite(n) ? n : 1);
                                  }}
                                />
                              </FormControl>
                              {rem != null ? (
                                <p className="text-xs text-muted-foreground">{rem} spots remaining for this event.</p>
                              ) : null}
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      {form.formState.errors.root?.message ? (
                        <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
                      ) : null}
                      <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button type="button" variant="outline" onClick={() => setActiveEvent(null)}>
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90"
                          onClick={async () => {
                            const ok = await form.trigger("tickets");
                            if (!ok) return;
                            const sold = soldForEvent(soldByEvent, activeEvent.id);
                            const rem = spotsRemaining(activeEvent, sold);
                            const want = form.getValues("tickets");
                            if (rem != null && want > rem) {
                              form.setError("tickets", {
                                message: `Only ${rem} seat${rem === 1 ? "" : "s"} left.`,
                              });
                              return;
                            }
                            setStep("details");
                          }}
                        >
                          Continue
                        </Button>
                      </DialogFooter>
                    </div>
                  </Form>
                ) : null}

                {step === "details" && activeEvent ? (
                  <Form {...form}>
                    <form
                      className="space-y-4"
                      onSubmit={form.handleSubmit(async (values) => {
                        if (!activeEvent || !user) return;
                        if (!isFree) return;
                        setReserving(true);
                        try {
                          const payload = {
                            user_id: user.id,
                            event_id: activeEvent.id,
                            name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
                            email: values.email.trim().toLowerCase(),
                            phone: values.phone.trim(),
                            tickets: values.tickets,
                            total_paid: 0,
                            status: "paid" as const,
                          };

                          const { data: inserted, error: insertError } = await supabase
                            .from("bookings")
                            .insert(payload)
                            .select("id")
                            .single();
                          if (insertError || !inserted?.id) throw insertError ?? new Error("Failed to create booking");

                          if (n8nFreeEventWebhookUrl) {
                            fetch(n8nFreeEventWebhookUrl, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                type: "event_reservation_free_confirmed",
                                created_at: new Date().toISOString(),
                                booking_id: inserted.id,
                                user_id: user.id,
                                event: activeEvent,
                                reservation: values,
                              }),
                            }).catch(() => {});
                          }

                          toast({
                            title: "Reserved — thank you!",
                            description: "Your reservation has been confirmed. You can manage it from your Dashboard.",
                          });
                          setActiveEvent(null);
                          navigate("/dashboard?checkout=success");
                        } catch (e) {
                          form.setError("root", {
                            message: e instanceof Error ? e.message : "Could not reserve this event",
                          });
                        } finally {
                          setReserving(false);
                        }
                      })}
                    >
                      <p className="font-body text-sm text-muted-foreground">
                        Tickets: <span className="text-foreground/90">{ticketCount}</span>
                        {activeEvent.price != null ? (
                          <span className="ml-2 text-foreground/80">
                            • Est. ${(activeEvent.price * ticketCount).toFixed(2)}
                          </span>
                        ) : null}
                      </p>

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
                              <p className="text-[11px] text-muted-foreground">Shown on your door list.</p>
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
                            <p className="text-[11px] text-muted-foreground">For your receipt and updates.</p>
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
                            <p className="text-[11px] text-muted-foreground">If we need to reach you about the event.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.formState.errors.root?.message ? (
                        <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
                      ) : null}

                      <DialogFooter className="mt-2 flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button type="button" variant="outline" onClick={() => setStep("tickets")} disabled={reserving}>
                          Back
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setActiveEvent(null)} disabled={reserving}>
                          Cancel
                        </Button>
                        {isFree ? (
                          <Button
                            type="submit"
                            className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90"
                            disabled={reserving}
                          >
                            {reserving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                                Saving…
                              </>
                            ) : (
                              "Confirm reservation"
                            )}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90"
                            disabled={reserving}
                            onClick={async () => {
                              const ok = await form.trigger(["firstName", "lastName", "email", "phone", "tickets"]);
                              if (!ok) return;
                              const sold = soldForEvent(soldByEvent, activeEvent.id);
                              const rem = spotsRemaining(activeEvent, sold);
                              const want = form.getValues("tickets");
                              if (rem != null && want > rem) {
                                form.setError("tickets", {
                                  message: `Only ${rem} seat${rem === 1 ? "" : "s"} left.`,
                                });
                                return;
                              }
                              setStep("pay");
                            }}
                          >
                            Continue to review
                          </Button>
                        )}
                      </DialogFooter>
                    </form>
                  </Form>
                ) : null}

                {step === "pay" && activeEvent && !isFree ? (
                  <div className="space-y-4">
                    <Collapsible open={summaryOpen} onOpenChange={setSummaryOpen} className="lg:hidden">
                      <CollapsibleTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-between border-border/70">
                          Order summary
                          <ChevronDown className={cn("h-4 w-4 transition-transform", summaryOpen ? "rotate-180" : "")} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">{orderSummary}</CollapsibleContent>
                    </Collapsible>

                    <div className="rounded-xl border border-border/60 bg-card/20 p-4 font-body text-sm text-muted-foreground">
                      <p className="text-foreground/90">
                        {form.getValues("firstName")} {form.getValues("lastName")}
                      </p>
                      <p className="mt-1 text-xs">{form.getValues("email")}</p>
                      <p className="mt-0.5 text-xs">{form.getValues("phone")}</p>
                      <p className="mt-3 text-xs">
                        {ticketCount} ticket{ticketCount === 1 ? "" : "s"} • $
                        {((activeEvent.price ?? 0) * ticketCount).toFixed(2)}
                      </p>
                    </div>

                    <p className="font-body text-xs text-muted-foreground">
                      You’ll complete payment on Stripe. Apple Pay and Google Pay appear when your device supports them.
                    </p>

                    <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
                      <Button type="button" variant="outline" onClick={() => setStep("details")} disabled={paying}>
                        Back
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setActiveEvent(null)} disabled={paying}>
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90"
                        disabled={paying}
                        onClick={async () => {
                          if (!activeEvent || !user) return;
                          const values = form.getValues();
                          const ok = await form.trigger(["firstName", "lastName", "email", "phone", "tickets"]);
                          if (!ok) return;

                          setPaying(true);
                          let newBookingId: string | null = null;
                          try {
                            const payload = {
                              user_id: user.id,
                              event_id: activeEvent.id,
                              name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
                              email: values.email.trim().toLowerCase(),
                              phone: values.phone.trim(),
                              tickets: values.tickets,
                              total_paid: 0,
                              status: "pending_payment" as const,
                            };

                            const { data: inserted, error: insertError } = await supabase
                              .from("bookings")
                              .insert(payload)
                              .select("id")
                              .single();
                            if (insertError || !inserted?.id) {
                              throw insertError ?? new Error("Failed to create booking");
                            }
                            newBookingId = inserted.id as string;

                            const url = await createCheckoutSessionUrl(newBookingId);
                            window.location.href = url;
                          } catch (e) {
                            const msg = e instanceof Error ? e.message : "Could not start checkout";
                            const capacityMiss =
                              msg.toLowerCase().includes("sold out") ||
                              msg.toLowerCase().includes("seat") ||
                              msg.toLowerCase().includes("spots");
                            if (newBookingId && capacityMiss) {
                              await supabase.from("bookings").delete().eq("id", newBookingId);
                            }
                            toast({
                              title: "Couldn’t start checkout",
                              description: capacityMiss
                                ? msg
                                : `${msg} If this keeps happening, call ${business.phoneDisplay}.`,
                            });
                            setPaying(false);
                          }
                        }}
                      >
                        {paying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                            Preparing secure payment…
                          </>
                        ) : (
                          "Continue to secure payment"
                        )}
                      </Button>
                    </DialogFooter>
                  </div>
                ) : null}
              </div>

              <aside className="hidden lg:block">
                <div className="sticky top-4 space-y-3">{orderSummary}</div>
              </aside>
        </div>
      </div>
        </DialogContent>
      </Dialog>
  </Layout>
);
};

export default Events;
