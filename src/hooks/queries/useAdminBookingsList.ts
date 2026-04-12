import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export type AdminBookingRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  tickets: number;
  total_paid: number;
  status: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  events: { name: string; date: string; time: string } | null;
};

export const adminBookingsListQueryKey = ["admin", "bookings", "list"] as const;

export function useAdminBookingsList() {
  return useQuery({
    queryKey: adminBookingsListQueryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          "id,name,email,phone,tickets,total_paid,status,stripe_checkout_session_id,stripe_payment_intent_id,created_at,events(name,date,time)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as AdminBookingRow[]) ?? [];
    },
  });
}
