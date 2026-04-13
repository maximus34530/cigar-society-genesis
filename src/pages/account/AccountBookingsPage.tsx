import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useUserBookings } from "@/hooks/queries/useUserBookings";
import { bookingStatusLabel } from "@/lib/bookingStatus";
import { embeddedEvent, errorMessage, parseEventDateTime } from "@/lib/bookingUtils";
import { CalendarDays } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

export default function AccountBookingsPage() {
  const { user } = useAuth();
  const { data: bookings = [], isPending, isError, error, refetch } = useUserBookings(user?.id);

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

  const errMsg = isError ? errorMessage(error, "Failed to load tickets") : null;

  return (
    <>
      <Card className="bg-card/40 border-border/60">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-heading">My tickets</CardTitle>
            <p className="mt-1 font-body text-sm text-muted-foreground">Upcoming events and past visits.</p>
            <p className="mt-2 font-body text-xs text-muted-foreground/80">
              All ticket sales are final and non-refundable. See{" "}
              <Link to="/terms" className="text-primary underline underline-offset-2 hover:text-primary/90">
                Terms
              </Link>{" "}
              for details.
            </p>
          </div>
          <Button asChild variant="outline" className="border-border/70 w-full sm:w-auto shrink-0">
            <Link to="/events">Browse events</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {errMsg ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
              <p className="font-body text-sm text-destructive">Couldn’t load tickets: {errMsg}</p>
            </div>
          ) : null}

          {isPending ? (
            <p className="font-body text-sm text-muted-foreground">Loading…</p>
          ) : upcoming.length === 0 && history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center">
              <p className="font-heading text-lg text-muted-foreground/90">No tickets yet</p>
              <p className="mt-2 font-body text-sm text-muted-foreground/70">Reserve an event and it will show here.</p>
              <div className="mt-5">
                <Button className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90" asChild>
                  <Link to="/events">Browse events</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {upcoming.length > 0 ? (
                <div className="space-y-3">
                  <p className="font-heading text-sm text-foreground/80">Upcoming</p>
                  {upcoming.map((b) => {
                    const ev = embeddedEvent(b);
                    return (
                      <div
                        key={b.id}
                        className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/30 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-heading text-base text-foreground">{ev?.name ?? "Event"}</p>
                            <Badge variant="outline" className="border-border/70 text-[10px] font-body uppercase tracking-wide">
                              {bookingStatusLabel(b.status)}
                            </Badge>
                          </div>
                          <p className="mt-1 font-body text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-foreground/70" aria-hidden />
                              {ev ? `${ev.date} • ${ev.time}` : "Event details unavailable"}
                            </span>
                          </p>
                          <p className="mt-2 font-body text-xs text-muted-foreground/80">
                            {b.tickets} ticket{b.tickets === 1 ? "" : "s"}{" "}
                            {Number.isFinite(b.total_paid) ? `• $${b.total_paid}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button type="button" variant="outline" className="border-border/70" onClick={() => void refetch()}>
                            Refresh
                          </Button>
                          <Button type="button" variant="outline" className="border-border/70" asChild>
                            <Link to="/events">View events</Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {history.length > 0 ? (
                <div className="space-y-3 border-t border-border/60 pt-6">
                  <p className="font-heading text-sm text-foreground/80">Past</p>
                  <div className="space-y-2">
                    {history.map((b) => {
                      const ev = embeddedEvent(b);
                      return (
                        <div key={b.id} className="rounded-xl border border-border/60 bg-card/20 px-4 py-3">
                          <p className="font-body text-sm text-foreground/80">
                            {ev?.name ?? "Event"} • {ev ? `${ev.date} ${ev.time}` : "No event linked"}
                          </p>
                          <p className="mt-1 font-body text-xs text-muted-foreground">
                            {bookingStatusLabel(b.status)} • {b.tickets} ticket{b.tickets === 1 ? "" : "s"}
                            {Number.isFinite(b.total_paid) ? ` • $${b.total_paid}` : ""}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
