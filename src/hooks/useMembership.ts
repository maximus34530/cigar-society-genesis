import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

// Phase 5 Epic E (#190) — richer membership hook used for UI gating.
// Co-exists with the lighter-weight useMembershipStatus from #183 so nothing
// shipped in #183 regresses; downstream callers should prefer this hook going
// forward.

export type MembershipStatus =
  | "incomplete"
  | "trialing"
  | "active"
  | "past_due"
  | "unpaid"
  | "canceled";

export type MembershipSnapshot = {
  status: MembershipStatus | null;
  plan: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  /**
   * True when the user should be treated as a member for UI purposes.
   * Mirrors the Phase 5 plan §5 rule: `active` or `trialing` within the current
   * period counts as a member, even when `cancel_at_period_end = true`.
   */
  isActive: boolean;
};

const NOT_A_MEMBER: MembershipSnapshot = {
  status: null,
  plan: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  isActive: false,
};

export function membershipQueryKey(userId: string | undefined) {
  return ["membership", "row", userId ?? ""] as const;
}

type MembershipRow = {
  status: string | null;
  plan: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
};

function deriveSnapshot(row: MembershipRow | null): MembershipSnapshot {
  if (!row) return NOT_A_MEMBER;

  const status = (row.status ?? null) as MembershipStatus | null;
  const currentPeriodEnd = row.current_period_end ?? null;
  const cancelAtPeriodEnd = Boolean(row.cancel_at_period_end);

  const inActiveStatus = status === "active" || status === "trialing";
  const periodStillOpen =
    currentPeriodEnd == null ||
    new Date(currentPeriodEnd).getTime() > Date.now();

  return {
    status,
    plan: row.plan ?? null,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    isActive: inActiveStatus && periodStillOpen,
  };
}

export type UseMembershipResult = MembershipSnapshot & {
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
};

export function useMembership(): UseMembershipResult {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;

  const query = useQuery<MembershipSnapshot>({
    // Keyed on userId so an auth change invalidates automatically.
    queryKey: membershipQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 60_000,
    retry: false,
    queryFn: async () => {
      if (!userId) return NOT_A_MEMBER;
      try {
        const { data, error } = await supabase
          .from("memberships")
          .select("status, plan, current_period_end, cancel_at_period_end")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) return NOT_A_MEMBER;
        return deriveSnapshot((data as MembershipRow | null) ?? null);
      } catch {
        // Defensive: keep the UI stable even if the table/migration isn't
        // present in the current environment (e.g. production pre-rollout).
        return NOT_A_MEMBER;
      }
    },
  });

  const snapshot = query.data ?? NOT_A_MEMBER;

  return {
    ...snapshot,
    isLoading: authLoading || (Boolean(userId) && query.isLoading),
    isError: query.isError,
    refetch: query.refetch,
  };
}
