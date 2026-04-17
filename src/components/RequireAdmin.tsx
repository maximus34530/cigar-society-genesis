import { AuthLoadingFallback } from "@/components/AuthLoadingFallback";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { loading, user, isAdmin, profile, profileError, refreshProfile } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoadingFallback />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!isAdmin) {
    return (
      <Layout>
        <section className="section-padding">
          <div className="container mx-auto max-w-2xl">
            <Card className="bg-card/40 border-border/60">
              <CardHeader>
                <CardTitle className="font-heading">Admin access not enabled</CardTitle>
                <p className="mt-2 font-body text-sm text-muted-foreground">
                  This account doesn’t have the <span className="text-foreground/80">admin</span> role, so the admin dashboard is blocked.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                  <p className="font-body text-sm text-muted-foreground">
                    <span className="text-foreground/80">Signed in as:</span> {user.email ?? user.id}
                  </p>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    <span className="text-foreground/80">Auth user id:</span> {user.id}
                  </p>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    <span className="text-foreground/80">Profile id:</span> {profile?.id ?? "Not found"}
                  </p>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    <span className="text-foreground/80">Profile role:</span> {profile?.role ?? "Not found"}
                  </p>
                  {profileError ? (
                    <p className="mt-2 font-body text-sm text-destructive">
                      Couldn’t load profile: {profileError}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border/70"
                    onClick={() => void refreshProfile()}
                  >
                    Refresh profile
                  </Button>
                  <Button asChild className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90">
                    <Link to="/account">Manage account</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                </div>

                <p className="font-body text-xs text-muted-foreground">
                  Fix: in Supabase → Table Editor → <code>profiles</code>, ensure there is a row where{" "}
                  <code>id</code> equals the <strong>Auth user id</strong> above, and set <code>role</code> to{" "}
                  <code>admin</code>.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </Layout>
    );
  }
  return <>{children}</>;
}

