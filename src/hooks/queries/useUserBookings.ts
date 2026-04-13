import { supabase } from "@/lib/supabase";
import type { UserBookingRow } from "@/lib/bookingUtils";
import { useQuery } from "@tanstack/react-query";

export const USER_BOOKING_SELECT =
  "id,tickets,total_paid,status,stripe_checkout_session_id,stripe_payment_intent_id,created_at,events(id,name,date,time)";

export function userBookingsQueryKey(userId: string | undefined) {
  return ["bookings", "user", userId ?? ""] as const;
}

export function useUserBookings(userId: string | undefined) {
  return useQuery({
    queryKey: userBookingsQueryKey(userId),
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(USER_BOOKING_SELECT)
        .eq("user_id", userId!)
        .eq("status", "paid")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as UserBookingRow[];
    },
  });
}
