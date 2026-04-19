import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Crown, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useMembership } from "@/hooks/useMembership";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";

// Phase 5 Epic D (#188) — membership card for `/dashboard`.
// Anchor id="membership" matches the hash the public /membership page uses
// when redirecting active members (`/dashboard#membership`).

// Plan labels — kept minimal until Epic C (#184) creates real Stripe prices.
// TODO(#184): Replace with a lookup against the real Stripe price catalog.
const PLAN_LABELS: Record<string, string> = {
  la_sociedad_monthly: "La Sociedad — Monthly",
};

function planLabel(plan: string | null): string {
  if (!plan) return "La Sociedad Membership";
  return PLAN_LABELS[plan] ?? "La Sociedad Membership";
}

function formatLongDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(iso: string | null): string {
  if (!iso) return "end of period";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "end of period";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type PillTone = "active" | "warn" | "danger" | "neutral";

function pillClasses(tone: PillTone): string {
  switch (tone) {
    case "active":
      return "border-primary/60 bg-primary/15 text-primary";
    case "warn":
      return "border-amber-500/40 bg-amber-500/10 text-amber-300";
    case "danger":
      return "border-destructive/50 bg-destructive/15 text-destructive";
    default:
      return "border-border/70 bg-card/40 text-muted-foreground";
  }
}

function statusPill(
  status: string | null,
  cancelAtPeriodEnd: boolean,
  currentPeriodEnd: string | null,
): { label: string; tone: PillTone } {
  if (status === "past_due") return { label: "Past due", tone: "danger" };
  if (status === "unpaid") return { label: "Unpaid", tone: "danger" };
  if (status === "canceled") return { label: "Canceled", tone: "neutral" };
  if (status === "incomplete") return { label: "Pending", tone: "warn" };
  if ((status === "active" || status === "trialing") && cancelAtPeriodEnd) {
    return {
      label: `Cancels ${formatShortDate(currentPeriodEnd)}`,
      tone: "warn",
    };
  }
  if (status === "trialing") return { label: "Trial", tone: "active" };
  if (status === "active") return { label: "Active", tone: "active" };
  return { label: "No membership", tone: "neutral" };
}

export function MembershipCard() {
  const {
    status,
    plan,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    isActive,
    isLoading,
  } = useMembership();
  const [portalBusy, setPortalBusy] = useState(false);

  const handleManageBilling = async () => {
    trackEvent("membership_manage_billing_click", { location: "dashboard_card" });
    setPortalBusy(true);
    try {
      // TODO(#187): The create-portal-session Edge Function lands in Epic D.
      // Best-effort invoke today — it either returns `{ url }` when Epic D is
      // live, or errors out, in which case we surface a graceful message.
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: {},
      });
      if (error) throw error;
      const url = (data as { url?: string } | null)?.url;
      if (!url) throw new Error("Missing portal URL");
      window.location.href = url;
    } catch {
      toast({
        title: "Billing management launching soon",
        description:
          "The Stripe customer portal isn't wired up yet. We'll enable it the moment subscriptions open.",
      });
      setPortalBusy(false);
    }
  };

  // Loading — lightweight placeholder so we never flash the CTA state for
  // active members during the initial query.
  if (isLoading) {
    return (
      <Card
        id="membership"
        className="scroll-mt-28 bg-card/40 border-border/60"
      >
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <Crown className="h-4 w-4 text-foreground/60" aria-hidden />
            Membership
          </CardTitle>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Loading your membership…
          </p>
        </CardHeader>
      </Card>
    );
  }

  // Member-like states: active, trialing, past_due, unpaid. Anything else
  // (null, canceled, incomplete) drops to the "become a member" CTA — a
  // canceled user can rejoin from /membership.
  const showMemberCard =
    isActive || status === "past_due" || status === "unpaid";

  if (!showMemberCard) {
    return (
      <Card
        id="membership"
        className="scroll-mt-28 bg-card/40 border-border/60"
      >
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 inline-flex h-9 w-9 flex-none items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary"
              aria-hidden
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="font-heading text-base">
                Become a member
              </CardTitle>
              <p className="mt-1 font-body text-sm text-muted-foreground">
                Join La Sociedad — priority seating, bourbon on your cigar, and a
                standing place in the lounge.
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="luxury"
            size="sm"
            className="md:shrink-0"
            onClick={() =>
              trackEvent("membership_view_membership_click", {
                location: "dashboard_cta",
              })
            }
          >
            <Link to="/membership">View membership</Link>
          </Button>
        </CardHeader>
      </Card>
    );
  }

  const pill = statusPill(status, cancelAtPeriodEnd, currentPeriodEnd);
  const periodLabel = cancelAtPeriodEnd
    ? "Access through"
    : status === "canceled"
      ? "Ended"
      : "Next renewal";

  return (
    <Card id="membership" className="scroll-mt-28 bg-card/40 border-border/60">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span
            className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary"
            aria-hidden
          >
            <Crown className="h-4 w-4" />
          </span>
          <div>
            <CardTitle className="font-heading text-base">
              {planLabel(plan)}
            </CardTitle>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              La Sociedad membership status and billing.
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-body uppercase tracking-wider ${pillClasses(pill.tone)}`}
        >
          {pill.label}
        </span>
      </CardHeader>
      <CardContent className="space-y-5">
        {status === "past_due" || status === "unpaid" ? (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm font-body text-destructive">
            <AlertCircle
              className="mt-0.5 h-4 w-4 flex-none"
              aria-hidden
            />
            <p>
              Your last payment didn't go through. Update your billing details to keep
              your access open.
            </p>
          </div>
        ) : null}

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="font-body text-xs uppercase tracking-widest text-muted-foreground">
              Plan
            </dt>
            <dd className="mt-1 font-heading text-sm text-foreground">
              {planLabel(plan)}
            </dd>
          </div>
          <div>
            <dt className="font-body text-xs uppercase tracking-widest text-muted-foreground">
              {periodLabel}
            </dt>
            <dd className="mt-1 font-body text-sm text-foreground/85">
              {formatLongDate(currentPeriodEnd)}
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="luxury"
            onClick={handleManageBilling}
            disabled={portalBusy}
            aria-busy={portalBusy}
            className="font-body text-sm uppercase tracking-wider"
          >
            {portalBusy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Opening portal…
              </>
            ) : (
              "Manage billing"
            )}
          </Button>
          <Button
            asChild
            type="button"
            variant="outline"
            className="border-border/70"
            onClick={() =>
              trackEvent("membership_view_membership_click", {
                location: "dashboard_card_benefits",
              })
            }
          >
            <Link to="/membership">View benefits</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
