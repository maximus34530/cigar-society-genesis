import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/FadeUp";
import { business } from "@/lib/business";

export default function Membership() {
  return (
    <Layout>
      <Seo
        title="Membership — La Sociedad"
        description={`Join ${business.shortName} membership for perks, priority access, and community. Manage your plan from your dashboard after signup.`}
        path="/membership"
      />

      <section className="section-warm-radial section-padding bg-background">
        <div className="container mx-auto max-w-4xl px-4">
          <FadeUp>
            <div className="text-center">
              <h1 className="hero-heading-glow !font-heading text-[clamp(1.85rem,5vw+0.5rem,3.5rem)] font-bold tracking-tight text-balance text-foreground drop-shadow-[0_2px_24px_hsl(0_0%_0%_/_0.35)]">
                Membership
              </h1>
              <p className="mx-auto mt-4 max-w-2xl font-body text-base leading-relaxed text-foreground/85 md:text-lg">
                Perks, community, and lounge-first experiences—built for the Rio Grande Valley.
              </p>
            </div>
          </FadeUp>

          <FadeUp>
            <div className="mt-10 rounded-2xl border border-border/60 bg-card/40 p-6 shadow-card sm:p-8">
              <h2 className="!font-heading text-2xl font-semibold text-foreground">Become a member</h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                Membership billing and perks are being finalized. When subscriptions go live, you’ll be able to join here
                and manage your plan from your dashboard.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button asChild variant="luxury">
                  <Link to="/signup">Create an account</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/dashboard">Go to dashboard</Link>
                </Button>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </Layout>
  );
}

