import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

// Phase 5 Epic F (#191) — admin members tab (read-only).
//
// This hook wraps the `public.admin_list_members()` SECURITY DEFINER RPC,
// which joins `memberships` with `profiles` and `auth.users` on the server
// (email lives in auth.users and is not reachable client-side). The function
// is guarded by `public.is_admin()` — non-admins receive a 42501 error.

export type AdminMemberRow = {
  membership_id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  plan: string | null;
  status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
};

export const adminMembersListQueryKey = ["admin", "members", "list"] as const;

export function useAdminMembersList() {
  return useQuery({
    queryKey: adminMembersListQueryKey,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_members");
      if (error) throw error;
      return (data as AdminMemberRow[] | null) ?? [];
    },
    staleTime: 30_000,
  });
}
