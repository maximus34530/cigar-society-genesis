import Layout from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { useAuth } from "@/hooks/useAuth";
import { useUserBookings } from "@/hooks/queries/useUserBookings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookingStatusLabel } from "@/lib/bookingStatus";
import { embeddedEvent, errorMessage, parseEventDateTime } from "@/lib/bookingUtils";
import { useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CalendarDays, ChevronRight, PartyPopper, Bell } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { MembershipCard } from "@/components/dashboard/MembershipCard";
import { MembershipSuccessBanner } from "@/components/dashboard/MembershipSuccessBanner";

const Dashboard = () => {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: bookings = [], isPending: loading, isError, error } = useUserBookings(user?.id);
  const loadError = isError ? errorMessage(error, "Failed to load") : null;
  const bookingsSectionRef = useRef<HTMLDivElement>(null);
  const [receiptBookingId, setReceiptBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      navigate("/admin", { replace: true });
      return;
    }
    const checkout = searchParams.get("checkout");
    if (checkout !== "success") return;

    const sessionId = searchParams.get("session_id");
    const bookingId = searchParams.get("booking_id");
    const qs = new URLSearchParams();
    qs.set("checkout", "success");
    if (sessionId) qs.set("session_id", sessionId);
    if (bookingId) qs.set("booking_id", bookingId);
    navigate(`/thank-you?${qs.toString()}`, { replace: true });
  }, [isAdmin, searchParams, navigate]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return bookings
      .filter((b) => {
        const ev = embeddedEvent(b);
        if (!ev) return false;
        const dt = parseEventDateTime(ev.date, ev.time);
        return dt ? dt >= now : true;
      })
      .sort((a, b) => {
        const ae = embeddedEvent(a);
        const be = embeddedEvent(b);
        if (!ae || !be) return 0;
        const ad = parseEventDateTime(ae.date, ae.time)?.getTime() ?? Number.POSITIVE_INFINITY;
        const bd = parseEventDateTime(be.date, be.time)?.getTime() ?? Number.POSITIVE_INFINITY;
        return ad - bd;
      });
  }, [bookings]);

  const history = useMemo(() => {
    const now = new Date();
    return bookings.filter((b) => {
      const ev = embeddedEvent(b);
      if (!ev) return true;
      const dt = parseEventDateTime(ev.date, ev.time);
      return dt ? dt < now : false;
    });
  }, [bookings]);

  const notifications = useMemo(() => {
    const items: Array<{ title: string; body: string }> = [];
    const firstUpcomingEvent = upcoming[0] ? embeddedEvent(upcoming[0]) : null;
    if (firstUpcomingEvent) {
      items.push({
        title: "Upcoming event",
        body: `${firstUpcomingEvent.name} • ${firstUpcomingEvent.date} ${firstUpcomingEvent.time}`,
      });
    }
    if (bookings.length === 0) {
      items.push({
        title: "Welcome to Cigar Society",
        body: "Browse events and get your first tickets for a night at the lounge.",
      });
    }
    items.push({
      title: "Need help?",
      body: "Call us at (956) 223-1303 for last‑minute questions.",
    });
    return items.slice(0, 3);
  }, [bookings.length, upcoming]);

  const displayName = profile?.full_name?.trim() ? profile.full_name : "there";
  const receiptBooking = useMemo(() => bookings.find((b) => b.id === receiptBookingId) ?? null, [bookings, receiptBookingId]);
  const receiptEvent = receiptBooking ? embeddedEvent(receiptBooking) : null;

  return (
    <RequireAuth>
      <Layout>
        <Seo title="Dashboard" description="Your account dashboard." path="/dashboard" noIndex />
        <section className="section-padding">
          <div className="container mx-auto max-w-5xl">
            <SectionHeading
              title={`Welcome, ${displayName}`}
              subtitle="Manage your event tickets and stay up to date with what’s happening at the lounge."
            />

            <MembershipSuccessBanner />

            {loadError ? (
              <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                <p className="font-body text-sm text-destructive">Couldn’t load your dashboard: {loadError}</p>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="bg-card/40 border-border/60">
                <CardHeader>
                  <CardTitle className="font-heading text-base flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-foreground/70" aria-hidden />
                    Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-body text-2xl text-foreground">{loading ? "—" : bookings.length}</p>
                  <p className="mt-1 font-body text-sm text-muted-foreground">Total paid event tickets</p>
                </CardContent>
              </Card>
              <Card className="bg-card/40 border-border/60">
                <CardHeader>
                  <CardTitle className="font-heading text-base flex items-center gap-2">
                    <PartyPopper className="h-4 w-4 text-foreground/70" aria-hidden />
                    Upcoming
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-body text-2xl text-foreground">{loading ? "—" : upcoming.length}</p>
                  <p className="mt-1 font-body text-sm text-muted-foreground">Upcoming events on your tickets</p>
                </CardContent>
              </Card>
              <Card className="bg-card/40 border-border/60">
                <CardHeader>
                  <CardTitle className="font-heading text-base flex items-center gap-2">
                    <Bell className="h-4 w-4 text-foreground/70" aria-hidden />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-body text-2xl text-foreground">{loading ? "—" : notifications.length}</p>
                  <p className="mt-1 font-body text-sm text-muted-foreground">Latest updates</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <MembershipCard />
            </div>

            <div ref={bookingsSectionRef} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
              <Card className="bg-card/40 border-border/60">
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="font-heading">Your upcoming tickets</CardTitle>
                    <p className="mt-1 font-body text-sm text-muted-foreground">Events you’re signed up for.</p>
                    <p className="mt-2 font-body text-xs text-muted-foreground/80">
                      All ticket sales are final and non-refundable. See{" "}
                      <Link to="/terms" className="text-primary underline underline-offset-2 hover:text-primary/90">
                        Terms
                      </Link>{" "}
                      for details.
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Link to="/events">
                      Browse events <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="font-body text-sm text-muted-foreground">Loading…</p>
                  ) : upcoming.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center">
                      <p className="font-heading text-lg text-muted-foreground/90">No upcoming tickets</p>
                      <p className="mt-2 font-body text-sm text-muted-foreground/70">
                        Pick an event and reserve your spot in seconds.
                      </p>
                      <div className="mt-5">
                        <Button className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90" asChild>
                          <Link to="/events">View events</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcoming.map((b) => (
                        <div
                          key={b.id}
                          className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/30 p-4 md:flex-row md:items-center md:justify-between"
                        >
                          {(() => {
                            const ev = embeddedEvent(b);
                            return (
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-heading text-base text-foreground">{ev?.name ?? "Event"}</p>
                                  <Badge variant="outline" className="border-border/70 text-[10px] font-body uppercase tracking-wide">
                                    {bookingStatusLabel(b.status)}
                                  </Badge>
                                </div>
                                <p className="mt-1 font-body text-sm text-muted-foreground">
                                  {ev ? `${ev.date} • ${ev.time}` : "Event details unavailable"}
                                </p>
                                <p className="mt-2 font-body text-xs text-muted-foreground/80">
                                  {b.tickets} tickets {Number.isFinite(b.total_paid) ? `• $${b.total_paid}` : ""}
                                </p>
                              </div>
                            );
                          })()}

                          <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                              type="button"
                              variant="outline"
                              className="border-border/70"
                              onClick={() => setReceiptBookingId(b.id)}
                            >
                              View receipt
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {history.length > 0 ? (
                    <div className="mt-6 border-t border-border/60 pt-5">
                      <p className="font-heading text-sm text-foreground/80">History</p>
                      <div className="mt-3 space-y-2">
                        {history.slice(0, 3).map((b) => (
                          <div key={b.id} className="rounded-xl border border-border/60 bg-card/20 px-4 py-3">
                            {(() => {
                              const ev = embeddedEvent(b);
                              return (
                                <p className="font-body text-sm text-foreground/80">
                                  {ev?.name ?? "Event"} • {ev ? `${ev.date} ${ev.time}` : "No event linked"}
                                </p>
                              );
                            })()}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/60">
                <CardHeader className="flex flex-col gap-2">
                  <CardTitle className="font-heading">Notifications</CardTitle>
                  <p className="font-body text-sm text-muted-foreground">Updates for your account.</p>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="font-body text-sm text-muted-foreground">Loading…</p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((n) => (
                        <div key={n.title} className="rounded-xl border border-border/60 bg-card/30 p-4">
                          <p className="font-heading text-sm text-foreground">{n.title}</p>
                          <p className="mt-1 font-body text-sm text-muted-foreground">{n.body}</p>
                        </div>
                      ))}
                      <p className="pt-2 font-body text-xs text-muted-foreground/70">
                        More notification controls (email + reminders) coming soon.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Dialog open={receiptBookingId != null} onOpenChange={(next) => (!next ? setReceiptBookingId(null) : null)}>
          <DialogContent className="max-w-xl border-border/60 bg-background">
            <DialogHeader className="text-center">
              <DialogTitle className="font-heading text-2xl tracking-wide">Reservation confirmed</DialogTitle>
              <div className="gold-divider mt-4" />
              <p className="mt-4 font-body text-sm text-muted-foreground">
                Hello{" "}
                <span className="text-foreground/85 font-medium">
                  {profile?.full_name?.trim() ? profile.full_name : user?.email ?? "there"}
                </span>
                , here are your ticket details.
              </p>
            </DialogHeader>

            <div className="rounded-xl border border-border/60 bg-card/30 p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">Event</p>
                  <p className="mt-1 font-heading text-base text-primary">
                    {receiptEvent?.name ?? "Event"}
                  </p>
                </div>
                <div>
                  <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">Date & time</p>
                  <p className="mt-1 font-body text-sm text-foreground/85">
                    {receiptEvent ? `${receiptEvent.date} at ${receiptEvent.time}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">Tickets</p>
                  <p className="mt-1 font-body text-sm text-foreground/85">
                    {receiptBooking ? `${receiptBooking.tickets} ${receiptBooking.tickets === 1 ? "Person" : "People"}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">Total paid</p>
                  <p className="mt-1 font-body text-sm text-foreground/85">
                    {receiptBooking && Number.isFinite(receiptBooking.total_paid)
                      ? `$${Number(receiptBooking.total_paid).toFixed(2)}`
                      : "—"}
                  </p>
                </div>
              </div>
              {receiptBooking ? (
                <div className="mt-4 flex justify-end">
                  <Badge variant="outline" className="border-border/70 text-[10px] font-body uppercase tracking-wide">
                    {bookingStatusLabel(receiptBooking.status)}
                  </Badge>
                </div>
              ) : null}
            </div>

            <p className="px-1 text-center font-body text-sm text-muted-foreground/90">
              Please have this confirmation ready upon arrival.
            </p>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" className="border-border/70" onClick={() => setReceiptBookingId(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Layout>
    </RequireAuth>
  );
};

export default Dashboard;
