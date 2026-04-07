import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { RequireAuth } from "@/components/RequireAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, profile, isAdmin, refreshProfile } = useAuth();

  return (
    <RequireAuth>
      <Layout>
        <Seo title="Profile" description="Your Cigar Society profile." path="/profile" />
        <section className="section-padding">
          <div className="container mx-auto max-w-4xl">
            <SectionHeading title="Profile" subtitle="Manage your account and view your event bookings." />

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

                  {isAdmin ? (
                    <Button asChild className="w-full bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90">
                      <Link to="/admin">Go to Admin</Link>
                    </Button>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="md:col-span-2 bg-card/40 border-border/60">
                <CardHeader>
                  <CardTitle className="font-heading">My bookings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="font-body text-sm text-muted-foreground">
                    Coming soon — this will show your event bookings from Supabase once the dashboard wiring is complete.
                  </p>
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

