import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Phase 5 — minimal membership status check for CTA routing on /membership.
// Intentionally lightweight; the richer hook lives in Epic E (#190: useMembership).
// Resilient to environments where the Phase 5 schema hasn't shipped yet
// (e.g. production before the memberships migration is applied): any error
// resolves to { isActive: false } rather than surfacing a page-breaking throw.

export type MembershipStatus = {
  isActive: boolean;
};

export function membershipStatusQueryKey(userId: string | undefined) {
  return ["membership", "status", userId ?? ""] as const;
}

export function useMembershipStatus(userId: string | undefined) {
  return useQuery<MembershipStatus>({
    queryKey: membershipStatusQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 60_000,
    retry: false,
    queryFn: async () => {
      if (!userId) return { isActive: false };
      try {
        const { data, error } = await supabase.rpc("is_active_member", {
          p_user_id: userId,
        });
        if (error) return { isActive: false };
        return { isActive: data === true };
      } catch {
        return { isActive: false };
      }
    },
  });
}
