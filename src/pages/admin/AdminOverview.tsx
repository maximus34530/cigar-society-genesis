import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCountUpOnView } from "@/hooks/useCountUpOnView";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { ArrowRight, CalendarDays, ChevronDown, PartyPopper, PoundSterling, Users } from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import { NavLink } from "react-router-dom";

type Counts = {
  events: number;
  clients: number;
  bookings: number;
};

export default function AdminOverview() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [sessions, clients, bookings] = await Promise.all([
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
      ]);

      if (cancelled) return;

      setCounts({
        events: sessions.count ?? 0,
        clients: clients.count ?? 0,
        bookings: bookings.count ?? 0,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button className="btn-gold-shimmer bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90">
            Quick Action
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border/70">
                All time <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Today</DropdownMenuItem>
              <DropdownMenuItem>Last 7 days</DropdownMenuItem>
              <DropdownMenuItem>Last 30 days</DropdownMenuItem>
              <DropdownMenuItem>All time</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {!counts ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-[118px] animate-pulse rounded-2xl border-border/40 bg-card/15" />
            ))}
          </>
        ) : (
          <>
            <StatCard title="Total Revenue" value="—" hint="Payments not enabled yet." icon={PoundSterling} />
            <StatCardMetric title="Client Base" value={counts.clients} hint="Total clients in your database." icon={Users} />
            <StatCardMetric title="Active Events" value={counts.events} hint="Events currently in your calendar." icon={PartyPopper} />
            <StatCardMetric
              title="Pending Actions"
              value={counts.bookings}
              hint="Bookings requiring review."
              icon={CalendarDays}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card className="bg-card/25 border-border/60 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-heading">Upcoming</CardTitle>
              <p className="mt-1 font-body text-sm text-muted-foreground">
                Bookings and sessions will appear here.
              </p>
            </div>
            <Button asChild variant="outline" className="border-border/70">
              <NavLink to="/admin/bookings">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </NavLink>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "Example booking", subtitle: "Awaiting payment • 2 tickets" },
              { title: "Example booking", subtitle: "Confirmed • 4 tickets" },
              { title: "Example booking", subtitle: "Needs review • Missing phone" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-card/30 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-heading text-sm text-foreground">{item.title}</p>
                  <p className="mt-0.5 font-body text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-xs font-body",
                    idx === 0
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : idx === 1
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-300",
                  )}
                >
                  {idx === 0 ? "Pending" : idx === 1 ? "Confirmed" : "Review"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/25 border-border/60 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading">Recent activity</CardTitle>
            <Button asChild variant="ghost" className="text-foreground/70 hover:bg-muted/50">
              <NavLink to="/admin/bookings">View</NavLink>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "New booking request", subtitle: "Waiting for payment confirmation." },
              { title: "Client updated", subtitle: "Phone number changed." },
              { title: "Session created", subtitle: "New category added." },
              { title: "Booking cancelled", subtitle: "Marked as cancelled by admin." },
            ].map((item, idx) => (
              <div key={idx} className="rounded-xl border border-border/60 bg-card/30 px-4 py-3">
                <p className="font-heading text-sm text-foreground">{item.title}</p>
                <p className="mt-0.5 font-body text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCardMetric({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: number;
  hint: string;
  icon: ComponentType<{ className?: string }>;
}) {
  const { ref, display } = useCountUpOnView(value);
  return (
    <Card ref={ref} className="bg-card/25 border-border/60 rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-heading text-sm text-foreground/90">{title}</CardTitle>
        <Icon className="h-4 w-4 text-foreground/50" />
      </CardHeader>
      <CardContent>
        <p className="font-heading text-2xl text-foreground">{display}</p>
        <p className="mt-1 font-body text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="bg-card/25 border-border/60 rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-heading text-sm text-foreground/90">{title}</CardTitle>
        <Icon className="h-4 w-4 text-foreground/50" />
      </CardHeader>
      <CardContent>
        <p className="font-heading text-2xl text-foreground">{value}</p>
        <p className="mt-1 font-body text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
