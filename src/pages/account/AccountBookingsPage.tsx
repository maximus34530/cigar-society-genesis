import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { userBookingsQueryKey, useUserBookings } from "@/hooks/queries/useUserBookings";
import { bookingStatusLabel } from "@/lib/bookingStatus";
import { embeddedEvent, errorMessage, parseEventDateTime, type UserBookingRow } from "@/lib/bookingUtils";
import { createCheckoutSessionUrl } from "@/lib/checkout";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Loader2, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function AccountBookingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: bookings = [], isPending, isError, error, refetch } = useUserBookings(user?.id);
  const [confirmCancel, setConfirmCancel] = useState<UserBookingRow | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [resumingId, setResumingId] = useState<string | null>(null);

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

  const errMsg = isError ? errorMessage(error, "Failed to load bookings") : null;

  return (
    <>
      <Card className="bg-card/40 border-border/60">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-heading">My bookings</CardTitle>
            <p className="mt-1 font-body text-sm text-muted-foreground">Upcoming events and past visits.</p>
          </div>
          <Button asChild variant="outline" className="border-border/70 w-full sm:w-auto shrink-0">
            <Link to="/events">Browse events</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {errMsg ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
              <p className="font-body text-sm text-destructive">Couldn’t load bookings: {errMsg}</p>
            </div>
          ) : null}

          {isPending ? (
            <p className="font-body text-sm text-muted-foreground">Loading…</p>
          ) : upcoming.length === 0 && history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center">
              <p className="font-heading text-lg text-muted-foreground/90">No bookings yet</p>
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
                          {b.status === "pending_payment" ? (
                            <p className="mt-2 font-body text-xs text-muted-foreground">Payment not completed yet.</p>
                          ) : null}
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          {b.status === "pending_payment" ? (
                            <Button
                              type="button"
                              className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90"
                              disabled={!!resumingId}
                              onClick={async () => {
                                setResumingId(b.id);
                                try {
                                  const url = await createCheckoutSessionUrl(b.id);
                                  window.location.href = url;
                                } catch (e) {
                                  toast({
                                    title: "Couldn’t resume checkout",
                                    description: e instanceof Error ? e.message : "Please try again.",
                                  });
                                  setResumingId(null);
                                }
                              }}
                            >
                              {resumingId === b.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                                  Opening…
                                </>
                              ) : (
                                "Complete payment"
                              )}
                            </Button>
                          ) : null}
                          <Button type="button" variant="outline" className="border-border/70" onClick={() => void refetch()}>
                            Refresh
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
                            {ev?.name ?? "Booking"} • {ev ? `${ev.date} ${ev.time}` : "No event linked"}
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

      <AlertDialog open={!!confirmCancel} onOpenChange={(next) => (!next ? setConfirmCancel(null) : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>This will remove your booking from the system.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep booking</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={cancelling}
              onClick={async () => {
                const row = confirmCancel;
                setConfirmCancel(null);
                if (!row || !user) return;
                setCancelling(true);
                try {
                  const { error: delErr } = await supabase.from("bookings").delete().eq("id", row.id);
                  if (delErr) throw delErr;
                  await queryClient.invalidateQueries({ queryKey: userBookingsQueryKey(user.id) });
                } catch (e) {
                  toast({
                    title: "Could not cancel",
                    description: errorMessage(e, "Please try again."),
                    variant: "destructive",
                  });
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
    </>
  );
}
