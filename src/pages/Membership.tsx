import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { FadeUp } from "@/components/FadeUp";
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
import { useMembership } from "@/hooks/useMembership";
import { business } from "@/lib/business";
import { trackEvent } from "@/lib/analytics";
import membershipHeroImg from "@/assets/membership-hero.jpg";
import {
  Check,
  Clock3,
  Sparkles,
  Users,
  Wine,
  CalendarHeart,
} from "lucide-react";

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

// Short, scannable product-card inclusions for the hero column. Kept in sync
// with the deeper PERKS grid below.
const QUICK_INCLUDES: ReadonlyArray<string> = [
  "Priority seating at the lounge",
  "Full bar — bourbon, beer, mixed drinks",
  "Weekly events and La Sociedad nights",
  "Open late, seven days a week",
] as const;

// TODO(#184): Replace placeholder amount + footnote once the Stripe price is
// created for `la_sociedad_monthly`. Keep the price visual honest until then
// rather than fabricating a number.
const PRICE_AMOUNT_DISPLAY = "$—";
const PRICE_CADENCE_LABEL = "/ month";
const PRICE_FOOTNOTE = "Pricing announced at launch.";

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
  const { user } = useAuth();
  // Migrated to the Epic E (#190) hook. `isLoading` already accounts for auth
  // loading once a user is signed in, so we don't need a separate `authLoading`
  // gate here.
  const { isActive, isLoading: membershipLoading } = useMembership();

  // Per Phase 5 plan §8 #6: attestation defaults ON at launch. Shared state so
  // the hero and footer CTAs stay in sync without duplicating the checkbox.
  const [attested, setAttested] = useState(true);

  const ctaState: CtaState = useMemo(() => {
    if (membershipLoading) return { kind: "loading" };
    if (!user) return { kind: "guest" };
    if (isActive) return { kind: "member" };
    return { kind: "subscribe" };
  }, [membershipLoading, user, isActive]);

  const ctaLabel = useMemo(() => {
    switch (ctaState.kind) {
      case "loading":
        return "Loading…";
      case "guest":
        return "Subscribe";
      case "member":
        return "View your membership";
      case "subscribe":
        return "Subscribe";
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

      {/* Product hero — two-column product-card layout (Creekside-style) */}
      <section className="relative overflow-hidden bg-background">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[radial-gradient(ellipse_at_top,hsl(var(--gold)),transparent_55%)]"
          aria-hidden
        />
        <div className="container relative mx-auto max-w-6xl px-4 py-12 md:py-20 lg:py-24">
          <div className="grid gap-10 md:grid-cols-2 md:items-center lg:gap-16">
            {/* Image column */}
            <FadeUp>
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border/60 shadow-card ring-1 ring-primary/20">
                <img
                  src={membershipHeroImg}
                  alt={`La Sociedad — ${business.publicVenueName} lounge interior`}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent"
                  aria-hidden
                />
                <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">
                  <Badge
                    variant="outline"
                    className="border-primary/60 bg-background/70 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-primary backdrop-blur md:text-xs"
                  >
                    La Sociedad
                  </Badge>
                  <span className="rounded-md border border-primary/40 bg-background/70 px-3 py-1 font-body text-[10px] uppercase tracking-[0.24em] text-primary backdrop-blur md:text-xs">
                    21+ Lounge
                  </span>
                </div>
              </div>
            </FadeUp>

            {/* Product info column */}
            <FadeUp delay={0.05}>
              <div className="flex flex-col gap-6">
                <div>
                  <p className="font-body text-xs uppercase tracking-[0.28em] text-primary">
                    Monthly Membership
                  </p>
                  <h1 className="hero-heading-glow mt-3 !font-heading text-[clamp(2rem,4vw+0.5rem,3.5rem)] font-bold leading-[1.05] tracking-tight text-balance text-foreground">
                    La Sociedad Membership
                  </h1>
                </div>

                {/* Price display */}
                <div className="flex items-baseline gap-3">
                  <span className="!font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                    {PRICE_AMOUNT_DISPLAY}
                  </span>
                  <span className="text-base font-body text-muted-foreground md:text-lg">
                    {PRICE_CADENCE_LABEL}
                  </span>
                </div>
                <p className="-mt-3 text-xs font-body text-muted-foreground">
                  {PRICE_FOOTNOTE}
                </p>

                {/* Short, punchy description */}
                <p className="text-base leading-relaxed text-muted-foreground font-body md:text-lg">
                  A monthly membership for the people who already know where to be on a Friday night.
                  Cigars, bourbon, and the room we built for them — in Pharr, serving the Rio Grande
                  Valley.
                </p>

                {/* Quick includes (scannable) */}
                <ul className="grid gap-2.5 text-sm text-muted-foreground font-body">
                  {QUICK_INCLUDES.map((text) => (
                    <li key={text} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full border border-primary/50 bg-primary/10 text-primary"
                        aria-hidden="true"
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>

                {/* 21+ attestation (single canonical copy, state shared with footer CTA) */}
                <div className="flex items-start gap-3 rounded-md border border-border/60 bg-card/40 px-4 py-3 text-left text-sm text-muted-foreground">
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
                    I confirm I am{" "}
                    <span className="font-semibold text-foreground">21 years or older</span>{" "}
                    and agree to show a valid ID at the lounge.
                  </label>
                </div>

                {/* Primary CTA + billing cadence microcopy */}
                <div className="flex flex-col gap-3">
                  <Button
                    variant="luxury"
                    size="lg"
                    onClick={() => handleCta("hero")}
                    disabled={ctaDisabled}
                    aria-disabled={ctaDisabled}
                    className="w-full md:w-auto md:min-w-[16rem]"
                  >
                    {ctaLabel}
                  </Button>
                  <p className="font-body text-xs text-muted-foreground">
                    Billed monthly. Cancel anytime. Taxes shown at checkout.
                  </p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="section-warm-radial section-padding bg-background">
        <FadeUp>
          <div className="container mx-auto max-w-6xl">
            <SectionHeading
              title="What's included"
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
                    <h3 className="!font-heading text-lg font-semibold text-foreground">
                      {title}
                    </h3>
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

      {/* FAQ */}
      <section className="section-padding bg-muted/40">
        <FadeUp>
          <div className="container mx-auto max-w-3xl">
            <SectionHeading
              title="Frequently asked"
              subtitle="Short, honest answers. If we missed one, call us at (956) 223-1303 or stop by."
            />
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, idx) => (
                <AccordionItem
                  key={item.q}
                  value={`item-${idx}`}
                  className="border-border/60"
                >
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

      {/* Footer CTA — secondary, attestation state shared with hero */}
      <section className="section-padding bg-background">
        <FadeUp>
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="!font-heading text-3xl font-semibold text-foreground md:text-4xl">
              Ready to join La Sociedad?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground font-body">
              One membership. One lounge. One community in the Rio Grande Valley.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Button
                variant="luxury"
                size="lg"
                onClick={() => handleCta("footer")}
                disabled={ctaDisabled}
                aria-disabled={ctaDisabled}
                className="min-w-[16rem]"
              >
                {ctaLabel}
              </Button>
              <p className="font-body text-xs text-muted-foreground">
                Billed monthly. Cancel anytime. {attested ? "" : "Confirm 21+ above to continue. "}
                Questions? Call {business.phoneDisplay}.
              </p>
            </div>
          </div>
        </FadeUp>
      </section>
    </Layout>
  );
};

export default Membership;
