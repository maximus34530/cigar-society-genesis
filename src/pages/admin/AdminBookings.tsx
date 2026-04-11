import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useEffect, useMemo, useState } from "react";

type BookingRow = {
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

function truncateId(id: string | null | undefined, len = 14) {
  if (!id) return "—";
  return id.length <= len ? id : `${id.slice(0, len)}…`;
}

export default function AdminBookings() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          "id,name,email,phone,tickets,total_paid,status,stripe_checkout_session_id,stripe_payment_intent_id,created_at,events(name,date,time)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRows((data as BookingRow[]) ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const eventName = r.events?.name?.toLowerCase() ?? "";
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        eventName.includes(q)
      );
    });
  }, [rows, query]);

  return (
    <Card className="bg-card/40 border-border/60">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="font-heading">Bookings</CardTitle>
          <p className="mt-1 font-body text-sm text-muted-foreground">View and manage event bookings.</p>
        </div>
        <div className="w-full md:w-80">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, event…"
            className="bg-card border-border"
          />
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <p className="font-body text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center">
            <p className="font-heading text-lg text-muted-foreground/90">No bookings yet</p>
            <p className="mt-2 font-body text-sm text-muted-foreground/70">Bookings will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/30 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-heading text-base text-foreground">{row.name}</p>
                  <p className="mt-1 font-body text-sm text-muted-foreground">
                    {row.email} • {row.phone}
                  </p>
                  <p className="mt-2 font-body text-xs text-muted-foreground/80">
                    {row.events ? `${row.events.name} • ${row.events.date} ${row.events.time}` : "No event linked"} •{" "}
                    {row.tickets} tickets • ${row.total_paid} • status: {row.status ?? "—"}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground/70 break-all">
                    Session: {truncateId(row.stripe_checkout_session_id, 18)} · PI:{" "}
                    {truncateId(row.stripe_payment_intent_id, 18)}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={async () => {
                      const { error } = await supabase.from("bookings").delete().eq("id", row.id);
                      if (!error) await load();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

