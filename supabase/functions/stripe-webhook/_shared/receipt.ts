import type { SupabaseClient } from "@supabase/supabase-js";

type EventEmbed = {
  id: string;
  name: string;
  date: string;
  time: string;
  price: number | null;
  capacity_total: number | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean | null;
};

type BookingReceiptRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  tickets: number;
  total_paid: number;
  receipt_sent_at: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  events: EventEmbed | EventEmbed[] | null;
};

function embeddedEvent(row: BookingReceiptRow): EventEmbed | null {
  if (!row.events) return null;
  return Array.isArray(row.events) ? row.events[0] ?? null : row.events;
}

/** Server-side n8n receipt; skips if secret unset or already sent. */
export async function sendReceiptEmail(admin: SupabaseClient, bookingId: string): Promise<void> {
  const url = Deno.env.get("N8N_RECEIPT_WEBHOOK_URL")?.trim();
  if (!url) {
    console.warn("[receipt] skip: set Supabase secret N8N_RECEIPT_WEBHOOK_URL to your n8n webhook URL");
    return;
  }

  const { data: row, error } = await admin
    .from("bookings")
    .select(
      "id,name,email,phone,tickets,total_paid,receipt_sent_at,stripe_checkout_session_id,stripe_payment_intent_id,events(id,name,date,time,price,capacity_total,description,image_url,is_active)",
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !row) {
    console.warn("[receipt] skip: booking load failed", bookingId, error?.message ?? "no row");
    return;
  }
  const typed = row as BookingReceiptRow;
  if (typed.receipt_sent_at) return;

  const event = embeddedEvent(typed);

  const body = JSON.stringify({
    type: "ticket_receipt_paid",
    booking_id: typed.id,
    event_id: event?.id ?? null,
    event_name: event?.name ?? null,
    event_date: event?.date ?? null,
    event_time: event?.time ?? null,
    event: event
      ? {
          id: event.id,
          name: event.name,
          date: event.date,
          time: event.time,
          price: event.price,
          capacity_total: event.capacity_total,
          description: event.description,
          image_url: event.image_url,
          is_active: event.is_active,
        }
      : null,
    attendee_name: typed.name,
    attendee_email: typed.email,
    attendee_phone: typed.phone,
    tickets: typed.tickets,
    total_paid: typed.total_paid,
    stripe_checkout_session_id: typed.stripe_checkout_session_id,
    stripe_payment_intent_id: typed.stripe_payment_intent_id,
  });

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("[receipt] n8n fetch failed", bookingId, msg);
    return;
  }

  if (!res.ok) {
    const snippet = (await res.text()).slice(0, 500);
    console.warn("[receipt] n8n non-OK", bookingId, res.status, snippet);
    return;
  }

  await admin.from("bookings").update({ receipt_sent_at: new Date().toISOString() }).eq("id", bookingId).is(
    "receipt_sent_at",
    null,
  );
}
