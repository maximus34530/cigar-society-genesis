import Layout from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { CalendarDays, ChevronRight, PartyPopper, Bell, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type BookingRow = {
  id: string;
  tickets: number;
  total_paid: number;
  created_at: string;
  events: { id: string; name: string; date: string; time: string } | { id: string; name: string; date: string; time: string }[] | null;
};

function errorMessage(value: unknown, fallback: string) {
  if (value instanceof Error) return value.message;
  if (typeof value === "object" && value && "message" in value && typeof (value as { message?: unknown }).message === "string") {
    return (value as { message: string }).message;
  }
  return fallback;
}

function parseEventDateTime(date: string, time: string) {
  const d = new Date(`${date}T${time}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function embeddedEvent(row: BookingRow) {
  if (!row.events) return null;
  return Array.isArray(row.events) ? row.events[0] ?? null : row.events;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [confirmCancel, setConfirmCancel] = useState<BookingRow | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("bookings")
      .select("id,tickets,total_paid,created_at,events(id,name,date,time)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (err) {
      setError(err.message);
      setBookings([]);
      setLoading(false);
      return;
    }

    setBookings(((data as unknown) as BookingRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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
        body: "Browse events and book your first night at the lounge.",
      });
    }
    items.push({
      title: "Need help?",
      body: "Call us at (956) 223-1303 for last‑minute questions.",
    });
    return items.slice(0, 3);
  }, [bookings.length, upcoming]);

  const displayName = profile?.full_name?.trim() ? profile.full_name : "there";

  return (
    <RequireAuth>
      <Layout>
        <Seo title="Dashboard" description="Your account dashboard." path="/dashboard" />
        <section className="section-padding">
          <div className="container mx-auto max-w-5xl">
            <SectionHeading
              title={`Welcome, ${displayName}`}
              subtitle="Manage your event bookings and stay up to date with what’s happening at the lounge."
            />

            {error ? (
              <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                <p className="font-body text-sm text-destructive">Couldn’t load your dashboard: {error}</p>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="bg-card/40 border-border/60">
                <CardHeader>
                  <CardTitle className="font-heading text-base flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-foreground/70" aria-hidden />
                    Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-body text-2xl text-foreground">{loading ? "—" : bookings.length}</p>
                  <p className="mt-1 font-body text-sm text-muted-foreground">Total event bookings</p>
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
                  <p className="mt-1 font-body text-sm text-muted-foreground">Upcoming event bookings</p>
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

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
              <Card className="bg-card/40 border-border/60">
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="font-heading">Your upcoming bookings</CardTitle>
                    <p className="mt-1 font-body text-sm text-muted-foreground">Events you’re signed up for.</p>
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
                      <p className="font-heading text-lg text-muted-foreground/90">No upcoming bookings</p>
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
                            <p className="font-heading text-base text-foreground">{ev?.name ?? "Event"}</p>
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
                            <Button type="button" variant="outline" className="border-border/70" asChild>
                              <Link to="/events">View events</Link>
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              className={cn(cancelling ? "opacity-80" : "")}
                              disabled={cancelling}
                              onClick={() => setConfirmCancel(b)}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel
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
                              {ev?.name ?? "Booking"} • {ev ? `${ev.date} ${ev.time}` : "No event linked"}
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
      </Layout>

      <AlertDialog open={!!confirmCancel} onOpenChange={(next) => (!next ? setConfirmCancel(null) : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your booking from the system. If you need help, call (956) 223-1303.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep booking</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={cancelling}
              onClick={async () => {
                const row = confirmCancel;
                setConfirmCancel(null);
                if (!row) return;
                setCancelling(true);
                try {
                  const { error: err } = await supabase.from("bookings").delete().eq("id", row.id);
                  if (err) throw err;
                  await load();
                } catch (e) {
                  setError(errorMessage(e, "Could not cancel booking"));
                } finally {
                  setCancelling(false);
                }
              }}
            >
              Cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </RequireAuth>
  );
};

export default Dashboard;

