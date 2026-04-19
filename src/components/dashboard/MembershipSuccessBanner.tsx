import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { membershipQueryKey } from "@/hooks/useMembership";
import { trackEvent } from "@/lib/analytics";

// Phase 5 Epic D (#188) — one-time confirmation banner after a successful
// subscription redirect from Stripe Checkout.
//
// URL contract (mirrors the ticket success banner in
// Stripe_Payment_Implementation_Plan.md §B):
//   /dashboard?membership=success&session_id=cs_test_...
//
// Responsibilities:
//   1. Show the banner exactly once per redirect (no re-show on refresh).
//   2. Best-effort call `finalize-subscription-session` (Epic C #186) so the
//      membership row is upserted even if the Stripe webhook is delayed.
//   3. Invalidate the `useMembership` query so the card picks up the new row.
//   4. Clear the `membership` + `session_id` params from the URL.

export function MembershipSuccessBanner() {
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const ranRef = useRef(false);

  const isSuccess = params.get("membership") === "success";
  const sessionId = params.get("session_id");

  useEffect(() => {
    if (!isSuccess || ranRef.current) return;
    ranRef.current = true;
    setVisible(true);
    trackEvent(
      "membership_checkout_success",
      sessionId ? { session_id: sessionId } : undefined,
    );

    void (async () => {
      if (sessionId) {
        try {
          // TODO(#186): finalize-subscription-session ships in Epic C. Until
          // then the invoke will error out and we silently continue — the
          // Stripe webhook remains the canonical source of truth.
          await supabase.functions.invoke("finalize-subscription-session", {
            body: { session_id: sessionId },
          });
        } catch {
          // swallow — webhook is authoritative
        }
      }
      queryClient.invalidateQueries({ queryKey: membershipQueryKey(user?.id) });

      const next = new URLSearchParams(params);
      next.delete("membership");
      next.delete("session_id");
      setParams(next, { replace: true });
    })();
  }, [isSuccess, sessionId, params, setParams, queryClient, user?.id]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-6 flex items-start gap-3 rounded-xl border border-primary/40 bg-primary/10 p-4 shadow-card"
    >
      <CheckCircle2
        className="mt-0.5 h-5 w-5 flex-none text-primary"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="!font-heading text-base font-semibold text-foreground">
          Welcome to La Sociedad.
        </p>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Your membership is being activated. Plan details will appear below in a
          few seconds — no need to refresh.
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setVisible(false)}
        className="shrink-0 font-body text-xs text-muted-foreground hover:text-foreground"
      >
        Dismiss
      </Button>
    </div>
  );
}
