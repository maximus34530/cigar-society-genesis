import { Link } from "react-router-dom";
import { ChevronRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMembership } from "@/hooks/useMembership";
import { trackEvent } from "@/lib/analytics";

// Phase 5 Epic D (#189) — read-only membership row on /account.
// Per the issue: "No Stripe / portal actions triggered from Account — those
// stay on Dashboard." This component deep-links to /dashboard#membership
// instead of replicating any portal logic.

// TODO(#184): Replace with a lookup against the real Stripe price catalog.
const PLAN_LABELS: Record<string, string> = {
  la_sociedad_monthly: "La Sociedad — Monthly",
};

function planLabel(plan: string | null): string {
  if (!plan) return "La Sociedad Membership";
  return PLAN_LABELS[plan] ?? "La Sociedad Membership";
}

function formatStatus(
  status: string | null,
  cancelAtPeriodEnd: boolean,
  isActive: boolean,
): string {
  if (!status) return "No active membership";
  if (cancelAtPeriodEnd && isActive) return "Active — cancels at period end";
  switch (status) {
    case "active":
      return "Active";
    case "trialing":
      return "Trial";
    case "past_due":
      return "Past due";
    case "unpaid":
      return "Unpaid";
    case "canceled":
      return "Canceled";
    case "incomplete":
      return "Checkout pending";
    default:
      return status;
  }
}

export function MembershipRow() {
  const { status, plan, cancelAtPeriodEnd, isActive, isLoading } =
    useMembership();

  const isMemberLikeState =
    isActive || status === "past_due" || status === "unpaid";

  return (
    <Card className="bg-card/40 border-border/60 lg:col-span-2">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2">
          <Crown className="h-4 w-4 text-primary" aria-hidden />
          Membership
        </CardTitle>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Your La Sociedad membership at a glance. Billing and cancellation live on
          your dashboard.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          {isLoading ? (
            <div className="space-y-1.5">
              <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                Plan
              </p>
              <p className="font-body text-sm text-muted-foreground">
                Loading your membership…
              </p>
            </div>
          ) : !isMemberLikeState ? (
            <div className="space-y-1.5">
              <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                Plan
              </p>
              <p className="font-heading text-base text-foreground">
                No active membership
              </p>
              <p className="font-body text-sm text-muted-foreground">
                Join La Sociedad for priority seating, events, and the full lounge
                experience.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                  Plan
                </p>
                <p className="font-heading text-base text-foreground">
                  {planLabel(plan)}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                  Status
                </p>
                <p className="font-body text-sm text-foreground/85">
                  {formatStatus(status, cancelAtPeriodEnd, isActive)}
                </p>
              </div>
            </div>
          )}

          {!isLoading && !isMemberLikeState ? (
            <Button
              asChild
              variant="luxury"
              size="sm"
              className="shrink-0"
              onClick={() =>
                trackEvent("membership_view_membership_click", {
                  location: "account_row",
                })
              }
            >
              <Link to="/membership">View membership</Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="shrink-0 border-border/70"
              onClick={() =>
                trackEvent("membership_manage_click", {
                  location: "account_row",
                })
              }
            >
              <Link to="/dashboard#membership">
                Manage membership
                <ChevronRight className="ml-1.5 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
