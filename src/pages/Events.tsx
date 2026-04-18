import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { EventCheckoutAuthDialog } from "@/components/EventCheckoutAuthDialog";
import { PublicEventCapacityBadges } from "@/components/PublicEventCapacityBadges";
import { FadeUp } from "@/components/FadeUp";
import { ScrollParallaxLayer } from "@/components/ScrollParallaxLayer";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import eventsHeroImg from "@/assets/gallery/events/641257260_17876872920513223_8406291060331286732_n.jpg";
import logoImg from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { business } from "@/lib/business";
import {
  EVENTS_PAGE_CARD_IMAGE_FRAME,
  EVENTS_PAGE_CARD_IMAGE_IMG,
  eventImageObjectStyle,
  isMissingEventsImageObjectPositionError,
} from "@/lib/eventImagePosition";
import { createCheckoutSessionUrl } from "@/lib/checkout";
import {
  eventCheckoutTotalCents,
  eventServiceChargeCentsFromSubtotalCents,
  eventTicketSubtotalCents,
  formatUsdFromCents,
} from "@/lib/eventCheckoutPricing";
import { trackEvent } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CalendarDays, ChevronDown, ChevronRight, Loader2, MapPin } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clearEventCheckoutAutorun,
  peekEventCheckoutDraft,
  stashEventCheckoutAutorun,
  stashEventCheckoutDraft,
  takeEventCheckoutAutorun,
  takeEventCheckoutDraft,
} from "@/lib/eventCheckoutDraft";
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
  image_object_position: string | null;
};

type CheckoutStep = "tickets" | "details" | "confirm";

function formatEventDateTime(dateRaw: string | null | undefined, timeRaw: string | null | undefined) {
  const dateStr = (dateRaw ?? "").trim();
  const timeStr = (timeRaw ?? "").trim();
  if (!dateStr && !timeStr) return "";
  if (!dateStr) return timeStr;
  if (!timeStr) return dateStr;

  const d = new Date(`${dateStr}T00:00:00`);
  const dateOk = !Number.isNaN(d.getTime());
  const dateLabel = dateOk
    ? new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(d)
    : dateStr;

  const ampmMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (ampmMatch) {
    const h = Number(ampmMatch[1]);
    const m = ampmMatch[2];
    const ap = ampmMatch[3].toUpperCase();
    const hh = h >= 1 && h <= 12 ? h : ((h % 12) || 12);
    return `${dateLabel} • ${hh}:${m} ${ap}`;
  }

  const hhmmMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmmMatch && dateOk) {
    const h = Number(hhmmMatch[1]);
    const m = Number(hhmmMatch[2]);
    if (Number.isFinite(h) && Number.isFinite(m)) {
      const dt = new Date(d);
      dt.setHours(h, m, 0, 0);
      const timeLabel = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(dt);
      return `${dateLabel} • ${timeLabel}`;
    }
  }

  return `${dateLabel} • ${timeStr}`;
}

function formatUsPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** First letter uppercase, rest lowercase; hyphenated segments each get the same treatment. */
function capitalizePersonNamePart(value: string): string {
  const t = value.trim();
  if (!t) return "";
  const seg = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "");
  return t.split("-").map(seg).join("-");
}

const reservationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name is required")
    .transform(capitalizePersonNamePart),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name is required")
    .transform(capitalizePersonNamePart),
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
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [soldByEvent, setSoldByEvent] = useState<Record<string, number>>({});
  const [reserving, setReserving] = useState(false);
  const [activeEvent, setActiveEvent] = useState<EventRow | null>(null);
  const [step, setStep] = useState<CheckoutStep>("tickets");
  const [paying, setPaying] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const checkoutAuthIntentRef = useRef<"free" | "paid" | null>(null);
  const authModalConsumedRef = useRef(false);
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

  const eventCheckoutMoney = useMemo(() => {
    if (!activeEvent || isFree) return null;
    const p = Number(activeEvent.price ?? 0);
    if (!Number.isFinite(p) || p <= 0) return null;
    const subC = eventTicketSubtotalCents(p, ticketCount);
    const svcC = eventServiceChargeCentsFromSubtotalCents(subC);
    return { subC, svcC, totC: subC + svcC };
  }, [activeEvent, isFree, ticketCount]);

  const stashCheckoutDraftForResume = useCallback(() => {
    if (!activeEvent) return;
    const v = form.getValues();
    const unit = Number(activeEvent.price ?? 0);
    const freeEvent = !Number.isFinite(unit) || unit <= 0;
    stashEventCheckoutDraft({
      eventId: activeEvent.id,
      tickets: v.tickets,
      firstName: capitalizePersonNamePart(v.firstName),
      lastName: capitalizePersonNamePart(v.lastName),
      email: v.email.trim(),
      phone: v.phone.trim(),
      pendingAction: freeEvent ? "free_reserve" : "paid_checkout",
    });
  }, [activeEvent, form]);

  const runCheckoutWithIntent = useCallback(
    async (intent: "free" | "paid" | null) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id;
      if (!activeEvent || !uid) {
        toast({ title: "Sign in required", description: "Please sign in to complete your tickets." });
        return;
      }

      const paidFlow = intent === "paid" || (intent === null && !isFree);
      const values = form.getValues();
      const firstName = capitalizePersonNamePart(values.firstName);
      const lastName = capitalizePersonNamePart(values.lastName);

      if (paidFlow) {
        setPaying(true);
        let newBookingId: string | null = null;
        try {
          const payload = {
            user_id: uid,
            event_id: activeEvent.id,
            name: `${firstName} ${lastName}`.trim(),
            email: values.email.trim().toLowerCase(),
            phone: values.phone.trim(),
            tickets: values.tickets,
            total_paid: 0,
            status: "pending_payment" as const,
          };

          const { data: inserted, error: insertError } = await supabase.from("bookings").insert(payload).select("id").single();
          if (insertError || !inserted?.id) throw insertError ?? new Error("Failed to create booking");
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
            description: capacityMiss ? msg : `${msg} If this keeps happening, call ${business.phoneDisplay}.`,
          });
          setPaying(false);
        }
      } else {
        setReserving(true);
        try {
          const payload = {
            user_id: uid,
            event_id: activeEvent.id,
            name: `${firstName} ${lastName}`.trim(),
            email: values.email.trim().toLowerCase(),
            phone: values.phone.trim(),
            tickets: values.tickets,
            total_paid: 0,
            status: "paid" as const,
          };

          const { data: inserted, error: insertError } = await supabase.from("bookings").insert(payload).select("id").single();
          if (insertError || !inserted?.id) throw insertError ?? new Error("Failed to create booking");

          if (n8nFreeEventWebhookUrl) {
            fetch(n8nFreeEventWebhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "event_reservation_free_confirmed",
                created_at: new Date().toISOString(),
                booking_id: inserted.id,
                user_id: uid,
                event: activeEvent,
                reservation: {
                  firstName,
                  lastName,
                  email: values.email.trim().toLowerCase(),
                  phone: values.phone.trim(),
                  tickets: values.tickets,
                },
                payment: null,
              }),
            }).catch(() => {});
          }

          setActiveEvent(null);
          setStep("tickets");
          form.reset({ firstName: "", lastName: "", email: "", phone: "", tickets: 1 });
          navigate("/thank-you?reserved=1");
        } catch (e) {
          form.setError("root", {
            message: e instanceof Error ? e.message : "Could not reserve this event",
          });
        } finally {
          setReserving(false);
        }
      }
    },
    [activeEvent, isFree, form, navigate, n8nFreeEventWebhookUrl],
  );

  const handleCheckoutAuthenticated = useCallback(() => {
    const intent = checkoutAuthIntentRef.current;
    checkoutAuthIntentRef.current = null;
    authModalConsumedRef.current = true;
    setAuthDialogOpen(false);
    void runCheckoutWithIntent(intent);
  }, [runCheckoutWithIntent]);

  const openReservation = useCallback(
    (event: EventRow) => {
      const sold = soldForEvent(soldByEvent, event.id);
      if (isSoldOut(event, sold)) {
        toast({
          title: "Sold out",
          description: "This event has reached capacity. Follow us for the next night.",
        });
        return;
      }

      clearEventCheckoutAutorun();
      setActiveEvent(event);
      setStep("tickets");
      setPaying(false);
      setAuthDialogOpen(false);
      checkoutAuthIntentRef.current = null;
      if (user) {
        form.reset({
          firstName: capitalizePersonNamePart(profile?.full_name?.trim()?.split(" ")?.[0] ?? ""),
          lastName: capitalizePersonNamePart(profile?.full_name?.trim()?.split(" ")?.slice(1).join(" ") ?? ""),
          email: user.email ?? "",
          phone: "",
          tickets: 1,
        });
      } else {
        form.reset({ firstName: "", lastName: "", email: "", phone: "", tickets: 1 });
      }
    },
    [user, soldByEvent, profile, form],
  );

  useEffect(() => {
    const reserveId = searchParams.get("reserve");
    if (!reserveId) return;
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
  }, [loading, events, searchParams, setSearchParams, openReservation]);

  useEffect(() => {
    if (loading) return;
    const raw = location.hash.replace(/^#/, "");
    if (!raw.startsWith("event-card-")) return;
    const el = document.getElementById(raw);
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [loading, location.hash, events.length]);

  useEffect(() => {
    if (searchParams.get("checkout_resume") !== "1") return;
    if (loading) return;

    if (!peekEventCheckoutDraft()) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("checkout_resume");
          return next;
        },
        { replace: true },
      );
      return;
    }

    if (events.length === 0) return;

    const draft = takeEventCheckoutDraft();
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("checkout_resume");
        return next;
      },
      { replace: true },
    );

    if (!draft) return;
    const ev = events.find((e) => e.id === draft.eventId);
    if (!ev) return;

    const sold = soldForEvent(soldByEvent, ev.id);
    if (isSoldOut(ev, sold)) {
      toast({
        title: "Sold out",
        description: "This event reached capacity while you were signing in. Pick another night.",
      });
      return;
    }

    setActiveEvent(ev);
    setStep("confirm");
    setPaying(false);
    if (draft.pendingAction === "paid_checkout") stashEventCheckoutAutorun("paid");
    else if (draft.pendingAction === "free_reserve") stashEventCheckoutAutorun("free");
    form.reset({
      firstName: capitalizePersonNamePart(draft.firstName),
      lastName: capitalizePersonNamePart(draft.lastName),
      email: draft.email,
      phone: draft.phone,
      tickets: draft.tickets,
    });
  }, [loading, events, soldByEvent, searchParams, setSearchParams, form]);

  useEffect(() => {
    if (!user || !activeEvent || step !== "confirm") return;
    const kind = takeEventCheckoutAutorun();
    if (!kind) return;
    void runCheckoutWithIntent(kind);
  }, [user, activeEvent, step, runCheckoutWithIntent]);

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
      description: "You can start again from Events when you’re ready. All ticket sales are final and non-refundable.",
    });

    requestAnimationFrame(() => {
      document.getElementById(`event-card-${eventId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;

    const loadEventsPage = async () => {
      setLoading(true);
      setError(null);

      try {
        const selectWithFocal =
          "id,name,date,time,price,capacity_total,description,image_url,image_path,image_object_position";
        const selectLegacy = "id,name,date,time,price,capacity_total,description,image_url,image_path";

        let { data, error: err } = await supabase
          .from("events")
          .select(selectWithFocal)
          .eq("is_active", true)
          .is("deleted_at", null)
          .order("date", { ascending: true })
          .order("time", { ascending: true });

        if (err && isMissingEventsImageObjectPositionError(err)) {
          ({ data, error: err } = await supabase
            .from("events")
            .select(selectLegacy)
            .eq("is_active", true)
            .is("deleted_at", null)
            .order("date", { ascending: true })
            .order("time", { ascending: true }));
        }

        if (err) throw err;
        const rows = ((data as (EventRow | Omit<EventRow, "image_object_position">)[] | null) ?? []).map((r) =>
          "image_object_position" in r ? r : { ...r, image_object_position: null as string | null },
        ) as EventRow[];
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
    };

    void loadEventsPage();

    let refetchDebounce: ReturnType<typeof setTimeout> | undefined;

    const scheduleRefetch = () => {
      window.clearTimeout(refetchDebounce);
      refetchDebounce = window.setTimeout(() => {
        if (!cancelled) void loadEventsPage();
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

  const stepTitle = (s: CheckoutStep) => {
    if (s === "tickets") return "Tickets";
    if (s === "details") return "Your details";
    return "Confirm";
  };

  const orderSummary = activeEvent ? (
    <div className="space-y-3 rounded-xl border border-border/60 bg-card/30 p-4">
      <p className="font-heading text-sm text-foreground">Order summary</p>
      <div>
        <p className="font-heading text-sm text-foreground">{activeEvent.name}</p>
        <p className="mt-1 font-body text-xs text-muted-foreground">
          {formatEventDateTime(activeEvent.date, activeEvent.time)}
        </p>
        <p className="mt-2 font-body text-xs text-muted-foreground">
          {business.publicVenueName} — {business.address}
        </p>
      </div>
      <div className="border-t border-border/60 pt-3 font-body text-sm">
        {!isFree && eventCheckoutMoney ? (
          <>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground/90 tabular-nums">{formatUsdFromCents(eventCheckoutMoney.subC)}</span>
            </div>
            <div className="mt-2 flex justify-between gap-2">
              <span className="text-muted-foreground">Service charge</span>
              <span className="text-foreground/90 tabular-nums">{formatUsdFromCents(eventCheckoutMoney.svcC)}</span>
            </div>
            <div className="mt-3 flex justify-between gap-2 border-t border-border/50 pt-3 font-medium text-foreground">
              <span>Total</span>
              <span className="tabular-nums">{formatUsdFromCents(eventCheckoutMoney.totC)}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Tickets are non-refundable.</p>
          </>
        ) : (
          <>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Tickets × {ticketCount}</span>
              <span className="text-foreground/90">—</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">No ticket charge for this event.</p>
          </>
        )}
      </div>
    </div>
  ) : null;

  const stepIndicator = (
    <div className="flex flex-wrap items-center gap-2 font-body text-xs text-muted-foreground">
      {(["tickets", "details", "confirm"] as const).map((s, i) => (
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
        <ScrollParallaxLayer
          speed={0.3}
          className="pointer-events-none absolute inset-0 -z-10 min-h-[110%] min-w-full"
          aria-hidden
        >
          <img
            src={eventsHeroImg}
            alt=""
            className="h-full w-full min-h-full min-w-full object-cover object-center blur-[0.8px] scale-[1.02]"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.225)] to-[rgba(0,0,0,0.275)]" />
        </ScrollParallaxLayer>
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
        <FadeUp>
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
                const ticketPrice = event.price != null ? Number(event.price) : null;
                const isEventFree =
                  ticketPrice == null || !Number.isFinite(ticketPrice) || ticketPrice <= 0;
                const imageSrc =
                  event.image_path != null && event.image_path.length > 0
                    ? supabase.storage.from("event-images").getPublicUrl(event.image_path).data.publicUrl
                    : event.image_url && event.image_url.length > 0
                      ? event.image_url
                      : null;
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
                      "group/event-card scroll-mt-28 flex h-full flex-col overflow-hidden border-primary/30 bg-card/40 shadow-sm transition-[colors,box-shadow] duration-500 ease-out",
                      soldOut
                        ? "cursor-not-allowed opacity-60"
                        : "hover:border-primary/45 hover:bg-card/50 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
                    )}
                  >
                    <div className={cn(EVENTS_PAGE_CARD_IMAGE_FRAME, "rounded-t-xl")}>
                      {imageSrc ? (
                        <img
                          key={`${event.id}-${event.image_object_position ?? "default"}`}
                          src={imageSrc}
                          alt=""
                          className={cn(EVENTS_PAGE_CARD_IMAGE_IMG, "block")}
                          style={eventImageObjectStyle(event.image_object_position)}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div
                          className="relative flex h-full w-full items-center justify-center bg-gradient-to-b from-background to-muted"
                          aria-hidden
                        >
                          <div className="pointer-events-none absolute inset-0 opacity-[0.14] bg-[radial-gradient(ellipse_at_50%_35%,hsl(var(--gold)),transparent_62%)]" />
                          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-32deg,transparent,transparent_10px,hsl(var(--gold)/0.045)_10px,hsl(var(--gold)/0.045)_11px)] opacity-[0.45]" />
                          <img src={logoImg} alt="" className="relative z-[1] h-[5.25rem] w-auto object-contain opacity-80" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="shrink-0 pb-3">
                      <CardTitle className="font-heading text-lg leading-snug">{event.name}</CardTitle>
                      <p className="font-body text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-4 w-4 shrink-0 text-foreground/70" aria-hidden />
                          {formatEventDateTime(event.date, event.time)}
                        </span>
                        {!isEventFree && event.price != null ? ` • $${event.price} per ticket` : null}
                      </p>
                      <p className="mt-2 flex flex-wrap items-center gap-2 font-body text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          {business.address}
                        </span>
                        {isEventFree ? (
                          <span className="inline-flex items-center rounded-full bg-gold-gradient px-2.5 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-gold">
                            FREE EVENT
                          </span>
                        ) : null}
                        <Badge variant="outline" className="border-border/70 text-[10px] uppercase tracking-wide">
                          21+
                        </Badge>
                        <PublicEventCapacityBadges remaining={remaining} soldOut={soldOut} />
                      </p>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-3 pt-0">
                      <div className="min-h-[5.5rem] flex-1">
                        {event.description ? (
                          <p className="font-body text-sm text-muted-foreground line-clamp-4">{event.description}</p>
                        ) : (
                          <p className="font-body text-sm text-muted-foreground">Details coming soon.</p>
                        )}
                      </div>

                      <div
                        className={cn(
                          buttonVariants({ variant: "outline", size: "default" }),
                          "mt-auto w-full justify-between gap-2 font-body text-sm",
                          soldOut
                            ? "pointer-events-none border-border/50 text-muted-foreground"
                            : "bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90 border-transparent",
                        )}
                      >
                        <span>{soldOut ? "Sold out" : "Get Tickets For VIP Tables"}</span>
                        {!soldOut ? <ArrowRight className="h-4 w-4 shrink-0 text-primary-foreground" aria-hidden /> : null}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <Button asChild variant="luxury">
              <a
                href={business.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("Events CTA", { location: "events-calendar" })}
              >
                Follow for updates
              </a>
            </Button>
          </div>
        </div>
        </FadeUp>
      </section>

      <Dialog
        open={!!activeEvent}
        onOpenChange={(next) => {
          if (!next) {
            clearEventCheckoutAutorun();
            checkoutAuthIntentRef.current = null;
            setAuthDialogOpen(false);
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
                    {formatEventDateTime(activeEvent.date, activeEvent.time)}
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
                          variant="luxury"
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
                    <div className="space-y-4">
                      <p className="font-body text-sm text-muted-foreground">
                        Tickets: <span className="text-foreground/90">{ticketCount}</span>
                        {activeEvent.price != null && !isFree ? (
                          <span className="ml-2 text-foreground/80">
                            • Est. total{" "}
                            {formatUsdFromCents(eventCheckoutTotalCents(Number(activeEvent.price), ticketCount))}
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
                                <Input
                                  {...field}
                                  className="bg-card border-border"
                                  autoComplete="given-name"
                                  onBlur={(e) => {
                                    field.onBlur();
                                    const next = capitalizePersonNamePart(e.target.value);
                                    if (next !== field.value) field.onChange(next);
                                  }}
                                />
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
                                <Input
                                  {...field}
                                  className="bg-card border-border"
                                  autoComplete="family-name"
                                  onBlur={(e) => {
                                    field.onBlur();
                                    const next = capitalizePersonNamePart(e.target.value);
                                    if (next !== field.value) field.onChange(next);
                                  }}
                                />
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
                        <Button
                          type="button"
                          variant="luxury"
                          disabled={reserving}
                          onClick={async () => {
                            const raw = form.getValues();
                            form.setValue("firstName", capitalizePersonNamePart(raw.firstName), { shouldValidate: true });
                            form.setValue("lastName", capitalizePersonNamePart(raw.lastName), { shouldValidate: true });
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
                            setStep("confirm");
                          }}
                        >
                          Continue to review
                        </Button>
                      </DialogFooter>
                    </div>
                  </Form>
                ) : null}

                {step === "confirm" && activeEvent ? (
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
                        {capitalizePersonNamePart(form.getValues("firstName"))}{" "}
                        {capitalizePersonNamePart(form.getValues("lastName"))}
                      </p>
                      <p className="mt-1 text-xs">{form.getValues("email")}</p>
                      <p className="mt-0.5 text-xs">{form.getValues("phone")}</p>
                      <p className="mt-3 text-xs">
                        {ticketCount} ticket{ticketCount === 1 ? "" : "s"}
                        {!isFree && activeEvent.price != null ? (
                          <>
                            {" "}
                            • {formatUsdFromCents(eventCheckoutTotalCents(Number(activeEvent.price), ticketCount))} total
                          </>
                        ) : null}
                      </p>
                    </div>

                    <p className="font-body text-xs text-muted-foreground">
                      {isFree ? (
                        <>
                          By reserving, you agree that all ticket sales are final and non-refundable. See{" "}
                          <Link to="/terms" className="text-primary underline underline-offset-2 hover:text-primary/90">
                            Terms
                          </Link>{" "}
                          for details.
                        </>
                      ) : (
                        <>
                          You’ll complete payment on Stripe. Apple Pay and Google Pay appear when your device supports them.
                          All ticket sales are final and non-refundable — see{" "}
                          <Link to="/terms" className="text-primary underline underline-offset-2 hover:text-primary/90">
                            Terms
                          </Link>
                          .
                        </>
                      )}
                    </p>

                    {form.formState.errors.root?.message ? (
                      <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
                    ) : null}

                    <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
                      <Button type="button" variant="outline" onClick={() => setStep("details")} disabled={paying || reserving}>
                        Back
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setActiveEvent(null)} disabled={paying || reserving}>
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="luxury"
                        disabled={paying || reserving}
                        onClick={async () => {
                          const raw = form.getValues();
                          form.setValue("firstName", capitalizePersonNamePart(raw.firstName), { shouldValidate: true });
                          form.setValue("lastName", capitalizePersonNamePart(raw.lastName), { shouldValidate: true });
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
                          if (!user) {
                            authModalConsumedRef.current = false;
                            checkoutAuthIntentRef.current = isFree ? "free" : "paid";
                            stashCheckoutDraftForResume();
                            setAuthDialogOpen(true);
                            return;
                          }
                          void runCheckoutWithIntent(null);
                        }}
                      >
                        {paying || reserving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                            {isFree ? "Saving…" : "Preparing secure payment…"}
                          </>
                        ) : isFree ? (
                          "Reserve"
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

      <EventCheckoutAuthDialog
        open={authDialogOpen}
        onOpenChange={(open) => {
          setAuthDialogOpen(open);
          if (!open && !authModalConsumedRef.current) checkoutAuthIntentRef.current = null;
          if (!open) authModalConsumedRef.current = false;
        }}
        onAuthenticated={handleCheckoutAuthenticated}
        onBeforeOAuth={stashCheckoutDraftForResume}
      />
  </Layout>
);
};

export default Events;
