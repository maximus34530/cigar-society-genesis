import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { FadeUp } from "@/components/FadeUp";
import { ScrollParallaxLayer } from "@/components/ScrollParallaxLayer";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMembershipStatus } from "@/hooks/useMembershipStatus";
import { business } from "@/lib/business";
import { trackEvent } from "@/lib/analytics";
import membershipHeroImg from "@/assets/membership-hero.jpg";
import { Check, Clock3, Sparkles, Users, Wine, CalendarHeart } from "lucide-react";

// TODO: Final membership perks list pending owner approval (plan §8 #4). Copy below is a
// restrained starter set that reflects existing lounge offerings only; do not promote
// perks the business has not confirmed (discounts, member-only events, etc.) before
// the navbar link is enabled.
const PERKS: Array<{ icon: typeof Sparkles; title: string; description: string }> = [
  {
    icon: Users,
    title: "La Sociedad community",
    description:
      "Join the lounge's inner circle — regulars, staff picks, and shared nights in the humidor.",
  },
  {
    icon: Wine,
    title: "Full bar, without the wait",
    description:
      "Bourbon, beer, and mixed drinks poured with your cigar — the way the lounge was built.",
  },
  {
    icon: CalendarHeart,
    title: "A seat at the events",
    description:
      "Live music, ladies' nights, car meets, game nights — we host weekly, and members have a place to land.",
  },
  {
    icon: Clock3,
    title: "Open late, all week",
    description: business.hoursText,
  },
];

// TODO: Final pricing pending owner approval (plan §8 #1). Keep this true to the site's
// current state rather than fabricating a price; swap in the real amount when the
// Stripe price is created in Epic C (#184).
const PRICE_LABEL = "Monthly — pricing announced at launch";

const FAQ_ITEMS: Array<{ q: string; a: string }> = [
  {
    q: "Do I have to be 21 or older?",
    a: "Yes. Cigar Society is a 21+ premium cigar lounge. We'll confirm your age at checkout and again at the door — bring a valid ID.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Membership is month-to-month and you can cancel whenever you want from your account. You'll keep access through the end of your current billing period.",
  },
  {
    q: "Where is the lounge?",
    a: `We're at ${business.address}. ${business.publicVenueName} — serving the Rio Grande Valley.`,
  },
  {
    q: "What's included at launch?",
    a: "La Sociedad is our founding membership. The core benefit is community — a standing place in the lounge, priority at events, and the experience of being a member as we grow. Additional perks will roll out over time and will always apply to active members first.",
  },
  {
    q: "Will there be taxes or fees?",
    a: "The monthly price you see at checkout is the price you pay. Any applicable taxes are shown clearly before you confirm.",
  },
];

type CtaState =
  | { kind: "loading" }
  | { kind: "guest" }
  | { kind: "member" }
  | { kind: "subscribe" };

const Membership = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: membership, isLoading: membershipLoading } = useMembershipStatus(user?.id);

  // Per Phase 5 plan §8 #6: attestation defaults ON at launch.
  const [attested, setAttested] = useState(true);

  const ctaState: CtaState = useMemo(() => {
    if (authLoading) return { kind: "loading" };
    if (!user) return { kind: "guest" };
    if (membershipLoading) return { kind: "loading" };
    if (membership?.isActive) return { kind: "member" };
    return { kind: "subscribe" };
  }, [authLoading, user, membershipLoading, membership?.isActive]);

  const ctaLabel = useMemo(() => {
    switch (ctaState.kind) {
      case "loading":
        return "Loading…";
      case "guest":
        return "Become a member";
      case "member":
        return "View your membership";
      case "subscribe":
        return "Become a member";
    }
  }, [ctaState.kind]);

  const ctaDisabled = ctaState.kind === "loading" || !attested;

  const handleCta = (location: "hero" | "footer") => {
    if (!attested) return;

    trackEvent("membership_cta_click", { location, state: ctaState.kind });

    switch (ctaState.kind) {
      case "loading":
        return;
      case "guest":
        // Matches the issue spec (`/login?return=/membership`) while also passing
        // the existing Login `state.from` mechanism so post-login routing works
        // regardless of which path Login reads first.
        navigate("/login?return=/membership", { state: { from: "/membership" } });
        return;
      case "member":
        navigate("/dashboard#membership");
        return;
      case "subscribe":
        // TODO(#184): Wire to the create-subscription-checkout-session Edge Function.
        // Until Epic C ships, surface a gentle "coming soon" message rather than
        // navigating to a route that doesn't exist yet.
        toast({
          title: "Subscriptions launching soon",
          description:
            "Payments are being finalized. We'll email you the moment La Sociedad opens for sign-up.",
        });
        return;
    }
  };

  return (
    <Layout>
      <Seo
        title="La Sociedad Membership"
        description={`Join La Sociedad — the monthly membership from ${business.shortName} in Pharr, TX. Priority seating, weekly events, and the full lounge experience. 21+.`}
        path="/membership"
      />

      {/* Hero */}
      <section className="relative flex min-h-[58vh] items-center justify-center overflow-hidden md:min-h-[65vh]">
        <ScrollParallaxLayer speed={0.3} className="absolute inset-0 min-h-[110%] will-change-transform">
          <img
            src={membershipHeroImg}
            alt={`La Sociedad — ${business.publicVenueName} lounge interior`}
            className="absolute inset-0 h-[115%] w-full min-h-full object-cover object-center -top-[7.5%]"
            decoding="async"
            fetchPriority="high"
            loading="eager"
          />
        </ScrollParallaxLayer>
        <div className="absolute inset-0 hero-overlay" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[radial-gradient(ellipse_at_top,hsl(var(--gold)),transparent_55%)]"
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-[min(100%,48rem)] px-4 text-center animate-fade-in">
          <Badge
            variant="outline"
            className="mb-6 border-primary/60 bg-background/40 px-3 py-1 text-xs uppercase tracking-[0.28em] text-primary"
          >
            La Sociedad
          </Badge>
          <h1 className="hero-heading-glow !font-heading text-[clamp(2rem,5vw+0.5rem,4rem)] font-bold tracking-tight text-balance text-foreground drop-shadow-[0_2px_24px_hsl(0_0%_0%_/_0.35)] md:text-[clamp(2.75rem,4vw+1rem,4rem)]">
            The lounge, on your terms.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground font-body md:text-lg">
            A monthly membership for the people who already know where to be on a Friday night. Cigars,
            bourbon, and the room we built for them — in Pharr, serving the Rio Grande Valley.
          </p>
          <p className="mt-4 text-sm font-body text-primary/90">{PRICE_LABEL}</p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="flex items-start gap-3 rounded-md border border-border/50 bg-background/60 px-4 py-3 text-left text-sm text-muted-foreground shadow-sm backdrop-blur">
              <Checkbox
                id="membership-attest-hero"
                checked={attested}
                onCheckedChange={(next) => setAttested(next === true)}
                aria-describedby="membership-attest-hero-label"
              />
              <label
                id="membership-attest-hero-label"
                htmlFor="membership-attest-hero"
                className="cursor-pointer select-none font-body leading-snug"
              >
                I confirm I am <span className="font-semibold text-foreground">21 years or older</span>{" "}
                and agree to show a valid ID at the lounge.
              </label>
            </div>

            <Button
              variant="luxury"
              size="lg"
              onClick={() => handleCta("hero")}
              disabled={ctaDisabled}
              aria-disabled={ctaDisabled}
              className="min-w-[14rem]"
            >
              {ctaLabel}
            </Button>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="section-warm-radial section-padding bg-background">
        <FadeUp>
          <div className="container mx-auto max-w-6xl">
            <SectionHeading
              title="What membership looks like"
              subtitle="La Sociedad is about the lounge, the room, and the people in it. Here's what you're joining."
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PERKS.map(({ icon: Icon, title, description }) => (
                <Card
                  key={title}
                  className="h-full border-border/60 bg-card/40 shadow-card ring-1 ring-border/40 transition-transform duration-300 hover:-translate-y-1"
                >
                  <CardContent className="flex h-full flex-col gap-4 p-6">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="!font-heading text-lg font-semibold text-foreground">{title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground font-body">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </FadeUp>
      </section>

      {/* Reassurances */}
      <section className="section-padding bg-muted/40">
        <FadeUp>
          <div className="container mx-auto max-w-4xl">
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { title: "Cancel anytime", body: "Month-to-month. No long-term commitment, no calls to cancel." },
                { title: "21+ lounge", body: "Texas law and house rules. Age is verified at checkout and at the door." },
                { title: "Built for the RGV", body: "One location, one team, one lounge — based in Pharr, Texas." },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-5"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-primary/50 bg-primary/10 text-primary">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="!font-heading text-base font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground font-body">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-background">
        <FadeUp>
          <div className="container mx-auto max-w-3xl">
            <SectionHeading
              title="Frequently asked"
              subtitle="Short, honest answers. If we missed one, call us at (956) 223-1303 or stop by."
            />
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, idx) => (
                <AccordionItem key={item.q} value={`item-${idx}`} className="border-border/60">
                  <AccordionTrigger className="text-left font-body text-base text-foreground">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground font-body">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </FadeUp>
      </section>

      {/* Footer CTA */}
      <section className="section-padding bg-muted/60">
        <FadeUp>
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="!font-heading text-3xl font-semibold text-foreground md:text-4xl">
              Ready to join La Sociedad?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground font-body">
              One membership. One lounge. One community in the Rio Grande Valley.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="flex items-start gap-3 rounded-md border border-border/50 bg-background/60 px-4 py-3 text-left text-sm text-muted-foreground shadow-sm">
                <Checkbox
                  id="membership-attest-footer"
                  checked={attested}
                  onCheckedChange={(next) => setAttested(next === true)}
                  aria-describedby="membership-attest-footer-label"
                />
                <label
                  id="membership-attest-footer-label"
                  htmlFor="membership-attest-footer"
                  className="cursor-pointer select-none font-body leading-snug"
                >
                  I confirm I am <span className="font-semibold text-foreground">21 years or older</span>{" "}
                  and agree to show a valid ID at the lounge.
                </label>
              </div>

              <Button
                variant="luxury"
                size="lg"
                onClick={() => handleCta("footer")}
                disabled={ctaDisabled}
                aria-disabled={ctaDisabled}
                className="min-w-[14rem]"
              >
                {ctaLabel}
              </Button>
              <p className="text-xs text-muted-foreground font-body">
                Questions? Call {business.phoneDisplay} — or visit {business.address}.
              </p>
            </div>
          </div>
        </FadeUp>
      </section>
    </Layout>
  );
};

export default Membership;
