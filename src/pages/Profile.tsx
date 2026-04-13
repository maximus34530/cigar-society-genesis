import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { RequireAuth } from "@/components/RequireAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { bookingStatusLabel } from "@/lib/bookingStatus";
import { supabase } from "@/lib/supabase";
import { embeddedEvent, errorMessage, parseEventDateTime } from "@/lib/bookingUtils";
import { useUserBookings } from "@/hooks/queries/useUserBookings";
import { CalendarDays } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, profile, isAdmin, refreshProfile } = useAuth();
  const { data: bookings = [], isPending: loadingBookings, isError, error, refetch } = useUserBookings(user?.id);
  const bookingsError = isError ? errorMessage(error, "Failed to load bookings") : null;

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

  return (
    <RequireAuth>
      <Layout>
        <Seo title="Profile" description="Your Cigar Society profile." path="/profile" noIndex />
        <section className="section-padding">
          <div className="container mx-auto max-w-4xl">
            <SectionHeading title="Profile" subtitle="Manage your account and view your event tickets." />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="md:col-span-1 bg-card/40 border-border/60">
                <CardHeader>
                  <CardTitle className="font-heading">Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-border/60">
                      <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
                      <AvatarFallback className="bg-muted text-foreground/80">
                        {(profile?.full_name?.trim()?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-body text-sm text-foreground truncate">
                        {profile?.full_name?.trim() || user?.email || "Account"}
                      </p>
                      <p className="font-body text-xs text-muted-foreground truncate">{user?.email}</p>
                      <p className="mt-1 inline-flex rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-xs font-body text-foreground/70">
                        Role: {profile?.role ?? "user"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-border/70"
                      onClick={async () => {
                        await refreshProfile();
                      }}
                    >
                      Refresh profile
                    </Button>
                    <Button asChild variant="outline" className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground">
                      <Link to="/account/profile">Account settings</Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-border/70"
                      onClick={async () => {
                        await supabase.auth.signOut();
                      }}
                    >
                      Log out
                    </Button>
                  </div>

                  <Button asChild variant="outline" className="w-full border-border/70">
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>

                  {isAdmin ? (
                    <Button asChild className="w-full bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90">
                      <Link to="/admin">Go to Admin</Link>
                    </Button>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="md:col-span-2 bg-card/40 border-border/60">
                <CardHeader>
                  <CardTitle className="font-heading">My tickets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {bookingsError ? (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                      <p className="font-body text-sm text-destructive">Couldn’t load bookings: {bookingsError}</p>
                    </div>
                  ) : null}

                  {loadingBookings ? (
                    <p className="font-body text-sm text-muted-foreground">Loading…</p>
                  ) : upcoming.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center">
                      <p className="font-heading text-lg text-muted-foreground/90">No tickets yet</p>
                      <p className="mt-2 font-body text-sm text-muted-foreground/70">
                        Reserve an event and it will show here.
                      </p>
                      <div className="mt-5">
                        <Button className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90" asChild>
                          <Link to="/events">Browse events</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
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
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </Layout>
    </RequireAuth>
  );
};

export default Profile;
