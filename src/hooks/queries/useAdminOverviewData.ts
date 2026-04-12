import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export type AdminOverviewBookingPreview = {
  id: string;
  name: string;
  email: string;
  tickets: number;
  total_paid: number;
  status: string | null;
  created_at: string;
  events: { name: string; date: string; time: string } | null;
};

export const adminOverviewQueryKey = ["admin", "overview"] as const;

export function useAdminOverviewData() {
  return useQuery({
    queryKey: adminOverviewQueryKey,
    queryFn: async () => {
      const [eventsRes, clientsRes, bookingsCountRes, paidRes, recentRes] = await Promise.all([
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("total_paid").eq("status", "paid"),
        supabase
          .from("bookings")
          .select("id,name,email,tickets,total_paid,status,created_at,events(name,date,time)")
          .order("created_at", { ascending: false })
          .limit(24),
      ]);

      if (eventsRes.error) throw eventsRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (bookingsCountRes.error) throw bookingsCountRes.error;
      if (paidRes.error) throw paidRes.error;
      if (recentRes.error) throw recentRes.error;

      const paidRows = paidRes.data ?? [];
      const paidRevenue = paidRows.reduce((sum, row) => sum + Number(row.total_paid ?? 0), 0);

      return {
        eventCount: eventsRes.count ?? 0,
        clientCount: clientsRes.count ?? 0,
        bookingCount: bookingsCountRes.count ?? 0,
        paidRevenue,
        recentBookings: (recentRes.data ?? []) as AdminOverviewBookingPreview[],
      };
    },
  });
}
