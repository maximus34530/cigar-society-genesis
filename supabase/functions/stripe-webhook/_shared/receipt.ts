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
  image_path: string | null;
  image_object_position: string | null;
  is_active: boolean | null;
};

type BookingReceiptRow = {
  id: string;
  event_id: string | null;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  tickets: number;
  total_paid: number;
  receipt_sent_at: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
};

function splitAttendeeName(full: string): { firstName: string; lastName: string } {
  const t = full.trim();
  if (!t) return { firstName: "", lastName: "" };
  const i = t.indexOf(" ");
  if (i === -1) return { firstName: t, lastName: "" };
  return { firstName: t.slice(0, i), lastName: t.slice(i + 1).trim() };
}

function eventPayloadFromRow(ev: EventEmbed) {
  return {
    id: ev.id,
    name: ev.name,
    date: ev.date,
    time: ev.time,
    price: ev.price,
    capacity_total: ev.capacity_total,
    description: ev.description,
    image_url: ev.image_url,
    image_path: ev.image_path,
    image_object_position: ev.image_object_position,
    is_active: ev.is_active,
  };
}

/** Build event block from Stripe Checkout metadata when DB row is unavailable. */
function eventFromStripeMetadata(meta: Record<string, string>): ReturnType<typeof eventPayloadFromRow> | null {
  const id = meta.event_id?.trim();
  if (!id) return null;
  const name = meta.event_name?.trim() ?? "";
  const date = meta.event_date?.trim() ?? "";
  const time = meta.event_time?.trim() ?? "";
  if (!name && !date && !time) return null;
  return {
    id,
    name,
    date,
    time,
    price: null,
    capacity_total: null,
    description: null,
    image_url: null,
    image_path: null,
    image_object_position: null,
    is_active: null,
  };
}

async function loadEventForBooking(admin: SupabaseClient, eventId: string): Promise<EventEmbed | null> {
  const fullSelect =
    "id,name,date,time,price,capacity_total,description,image_url,image_path,image_object_position,is_active";
  const { data, error } = await admin.from("events").select(fullSelect).eq("id", eventId).maybeSingle();
  if (!error && data) return data as EventEmbed;

  const narrow = "id,name,date,time,price,capacity_total,description,image_url,is_active";
  const { data: narrowRow, error: narrowErr } = await admin.from("events").select(narrow).eq("id", eventId).maybeSingle();
  if (narrowErr || !narrowRow) {
    console.warn("[receipt] events load failed", eventId, error?.message ?? narrowErr?.message ?? "no row");
    return null;
  }
  const r = narrowRow as Omit<EventEmbed, "image_path" | "image_object_position">;
  return {
    ...r,
    image_path: null,
    image_object_position: null,
  };
}

/**
 * Server-side n8n receipt; skips if secret unset or already sent.
 * `stripeSessionMetadata` fills gaps when Checkout was created with event_* metadata or when an embed would fail.
 */
export async function sendReceiptEmail(
  admin: SupabaseClient,
  bookingId: string,
  stripeSessionMetadata?: Record<string, string> | null,
): Promise<void> {
  const url = Deno.env.get("N8N_RECEIPT_WEBHOOK_URL")?.trim();
  if (!url) {
    console.warn("[receipt] skip: set Supabase secret N8N_RECEIPT_WEBHOOK_URL to your n8n webhook URL");
    return;
  }

  const { data: row, error } = await admin
    .from("bookings")
    .select(
      "id,event_id,user_id,name,email,phone,tickets,total_paid,receipt_sent_at,stripe_checkout_session_id,stripe_payment_intent_id",
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !row) {
    console.warn("[receipt] skip: booking load failed", bookingId, error?.message ?? "no row");
    return;
  }
  const typed = row as BookingReceiptRow;
  if (typed.receipt_sent_at) return;

  const meta = stripeSessionMetadata ?? undefined;
  const eventIdForLoad = (typed.event_id?.trim() || meta?.event_id?.trim() || "") || null;

  let eventPayload: ReturnType<typeof eventPayloadFromRow> | null = null;
  if (eventIdForLoad) {
    const ev = await loadEventForBooking(admin, eventIdForLoad);
    if (ev) eventPayload = eventPayloadFromRow(ev);
  }
  if (!eventPayload && meta) {
    eventPayload = eventFromStripeMetadata(meta);
  }

  const created_at = new Date().toISOString();
  const { firstName, lastName } = splitAttendeeName(typed.name);

  const body = JSON.stringify({
    type: "event_reservation_paid_confirmed",
    created_at,
    booking_id: typed.id,
    user_id: typed.user_id ?? null,
    event: eventPayload,
    event_name: eventPayload?.name ?? null,
    event_date: eventPayload?.date ?? null,
    event_time: eventPayload?.time ?? null,
    reservation: {
      firstName,
      lastName,
      email: typed.email,
      phone: typed.phone,
      tickets: typed.tickets,
    },
    payment: {
      total_paid: typed.total_paid,
      stripe_checkout_session_id: typed.stripe_checkout_session_id,
      stripe_payment_intent_id: typed.stripe_payment_intent_id,
    },
    stripe_metadata: meta ?? null,
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
