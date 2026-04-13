import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCountUpOnView } from "@/hooks/useCountUpOnView";
import { useAdminOverviewData, type AdminOverviewBookingPreview } from "@/hooks/queries/useAdminOverviewData";
import { bookingStatusLabel } from "@/lib/bookingStatus";
import { parseEventDateTime } from "@/lib/bookingUtils";
import { cn } from "@/lib/utils";
import { ArrowRight, CalendarDays, DollarSign, PartyPopper, Users } from "lucide-react";
import { useMemo } from "react";
import { NavLink } from "react-router-dom";

function upcomingBookings(rows: AdminOverviewBookingPreview[]) {
  const now = new Date();
  return rows
    .filter((r) => {
      const ev = r.events;
      if (!ev) return false;
      const dt = parseEventDateTime(ev.date, ev.time);
      return dt ? dt >= now : true;
    })
    .sort((a, b) => {
      const ae = a.events;
      const be = b.events;
      if (!ae || !be) return 0;
      const ad = parseEventDateTime(ae.date, ae.time)?.getTime() ?? Number.POSITIVE_INFINITY;
      const bd = parseEventDateTime(be.date, be.time)?.getTime() ?? Number.POSITIVE_INFINITY;
      return ad - bd;
    })
    .slice(0, 5);
}

function activityFromBookings(rows: AdminOverviewBookingPreview[]) {
  return [...rows]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((r) => {
      const evName = r.events?.name ?? "Event";
      const status = bookingStatusLabel(r.status);
      return {
        title: `Ticket sale • ${evName}`,
        subtitle: `${r.name} • ${status} • ${r.tickets} ticket${r.tickets === 1 ? "" : "s"}`,
      };
    });
}

export default function AdminOverview() {
  const { data, isPending, isError } = useAdminOverviewData();

  const counts = useMemo(
    () => ({
      events: data?.eventCount ?? 0,
      clients: data?.clientCount ?? 0,
      paidTicketSales: data?.paidTicketSalesCount ?? 0,
    }),
    [data],
  );

  const paidRevenue = data?.paidRevenue ?? 0;
  const revenueLabel =
    paidRevenue > 0
      ? `$${paidRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
      : "—";

  const upcoming = data?.recentBookings ? upcomingBookings(data.recentBookings) : [];
  const activity = data?.recentBookings ? activityFromBookings(data.recentBookings) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button asChild className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90">
            <NavLink to="/admin/events">Manage events</NavLink>
          </Button>
          <Button asChild variant="outline" className="border-border/70">
            <NavLink to="/admin/bookings">Ticket sales</NavLink>
          </Button>
          <Button asChild variant="outline" className="border-border/70">
            <NavLink to="/admin/clients">Clients</NavLink>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          title="Ticket revenue (paid)"
          value={revenueLabel}
          hint="Sum of paid ticket totals. Stripe fees not shown; all sales final per Terms."
          icon={DollarSign}
        />
        <StatCard title="Client base" value={counts.clients} hint="Total clients in your database." icon={Users} />
        <StatCard title="Active events" value={counts.events} hint="Events currently in your calendar." icon={PartyPopper} />
        <StatCard
          title="Paid ticket sales"
          value={counts.paidTicketSales}
          hint="Completed purchases only. Unpaid or abandoned checkouts stay in the database but are hidden here for now."
          icon={CalendarDays}
        />
      </div>

      {isError ? (
        <p className="font-body text-sm text-destructive">Couldn’t load overview data. Refresh the page.</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card className="bg-card/25 border-border/60 rounded-2xl premium-card-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-heading">Upcoming</CardTitle>
              <p className="mt-1 font-body text-sm text-muted-foreground">Paid tickets for upcoming events (from recent data).</p>
            </div>
            <Button asChild variant="outline" className="border-border/70">
              <NavLink to="/admin/bookings">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </NavLink>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isPending ? (
              <p className="font-body text-sm text-muted-foreground">Loading…</p>
            ) : upcoming.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-6 text-center">
                <p className="font-body text-sm text-muted-foreground">No upcoming bookings in the latest snapshot.</p>
              </div>
            ) : (
              upcoming.map((r) => {
                const ev = r.events;
                const label = bookingStatusLabel(r.status);
                const tone =
                  r.status === "pending_payment"
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : r.status === "paid"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-border/60 bg-muted/30 text-foreground/80";
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-card/30 px-4 py-3 gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-heading text-sm text-foreground truncate">{ev?.name ?? "Event"}</p>
                      <p className="mt-0.5 font-body text-xs text-muted-foreground truncate">
                        {r.name} • {r.tickets} tickets • {ev ? `${ev.date} ${ev.time}` : "—"}
                      </p>
                    </div>
                    <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-xs font-body", tone)}>{label}</span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/25 border-border/60 rounded-2xl premium-card-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading">Recent activity</CardTitle>
            <Button asChild variant="ghost" className="text-foreground/70 hover:bg-muted/50">
              <NavLink to="/admin/bookings">View</NavLink>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isPending ? (
              <p className="font-body text-sm text-muted-foreground">Loading…</p>
            ) : activity.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-6 text-center">
                <p className="font-body text-sm text-muted-foreground">No recent paid ticket sales yet.</p>
              </div>
            ) : (
              activity.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-border/60 bg-card/30 px-4 py-3">
                  <p className="font-heading text-sm text-foreground">{item.title}</p>
                  <p className="mt-0.5 font-body text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCardNumeric({ target }: { target: number }) {
  const { ref, display } = useCountUpOnView(target);
  return (
    <p className="font-heading text-2xl text-foreground tabular-nums">
      <span ref={ref}>{display}</span>
    </p>
  );
}

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const isDash = value === "—";
  const isNumeric = typeof value === "number";

  return (
    <Card className="bg-card/25 border-border/60 rounded-2xl premium-card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-heading text-sm text-foreground/90">{title}</CardTitle>
        <Icon className="h-4 w-4 text-foreground/50" />
      </CardHeader>
      <CardContent>
        {isDash ? (
          <p className="font-heading text-2xl text-foreground">—</p>
        ) : isNumeric ? (
          <StatCardNumeric target={value} />
        ) : (
          <p className="font-heading text-2xl text-foreground tabular-nums">{value}</p>
        )}
        <p className="mt-1 font-body text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
