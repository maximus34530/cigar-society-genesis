import Layout from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Outlet, NavLink, useLocation } from "react-router-dom";

export default function AccountLayout() {
  const location = useLocation();

  return (
    <RequireAuth>
      <Layout>
        <Seo title="Account" description="Manage your Cigar Society account." path="/account" noIndex />
        <section className="section-padding">
          <div className="container mx-auto max-w-4xl">
            <SectionHeading title="Account" subtitle="Profile settings and your event tickets in one place." />

            <div className="mb-8 flex flex-wrap gap-2">
              <Button
                asChild
                variant={location.pathname.startsWith("/account/profile") ? "default" : "outline"}
                className={cn(
                  location.pathname.startsWith("/account/profile")
                    ? "bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90"
                    : "border-border/70",
                )}
              >
                <NavLink to="/account/profile">Profile</NavLink>
              </Button>
              <Button
                asChild
                variant={location.pathname.startsWith("/account/bookings") ? "default" : "outline"}
                className={cn(
                  location.pathname.startsWith("/account/bookings")
                    ? "bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90"
                    : "border-border/70",
                )}
              >
                <NavLink to="/account/bookings">Tickets</NavLink>
              </Button>
            </div>

            <Outlet />
          </div>
        </section>
      </Layout>
    </RequireAuth>
  );
}
