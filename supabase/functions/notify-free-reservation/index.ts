import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const corsHeaders: { [k: string]: string } = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function handleOptions(): Response {
  return new Response("ok", { headers: corsHeaders });
}

function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(corsHeaders);
  headers.set("Content-Type", "application/json");
  if (init.headers) {
    new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  }
  return new Response(JSON.stringify(data), { ...init, headers });
}

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

type BookingRow = {
  id: string;
  event_id: string | null;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  tickets: number;
  total_paid: number | null;
  status: string | null;
  events: EventEmbed | null;
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

async function loadBookingWithEvent(admin: SupabaseClient, bookingId: string) {
  const fullEmbed =
    "id,event_id,user_id,name,email,phone,tickets,total_paid,status,events(id,name,date,time,price,capacity_total,description,image_url,image_path,image_object_position,is_active)";
  const { data, error } = await admin.from("bookings").select(fullEmbed).eq("id", bookingId).maybeSingle();
  if (!error && data) return { row: data as BookingRow, err: null as string | null };

  const narrowEmbed =
    "id,event_id,user_id,name,email,phone,tickets,total_paid,status,events(id,name,date,time,price,capacity_total,description,image_url,is_active)";
  const { data: narrowRow, error: narrowErr } = await admin
    .from("bookings")
    .select(narrowEmbed)
    .eq("id", bookingId)
    .maybeSingle();
  if (narrowErr || !narrowRow) {
    return { row: null, err: error?.message ?? narrowErr?.message ?? "no row" };
  }
  const r = narrowRow as BookingRow;
  const ev = r.events;
  return {
    row: {
      ...r,
      events: ev
        ? {
            ...ev,
            image_path: ev.image_path ?? null,
            image_object_position: (ev as { image_object_position?: string | null }).image_object_position ?? null,
          }
        : null,
    },
    err: null as string | null,
  };
}

function isPaidFreeEventBooking(row: BookingRow): boolean {
  if ((row.status ?? "").trim() !== "paid") return false;
  const paid = Number(row.total_paid ?? 0);
  if (!Number.isFinite(paid) || paid !== 0) return false;
  const ev = row.events;
  if (!ev?.id) return false;
  const unit = Number(ev.price ?? 0);
  return !Number.isFinite(unit) || unit <= 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });

  let body: { booking_id?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, { status: 400 });
  }

  const bookingId = body.booking_id?.trim();
  if (!bookingId) return json({ error: "booking_id is required" }, { status: 400 });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const n8nUrl = Deno.env.get("N8N_FREE_RESERVATION_WEBHOOK_URL")?.trim();

  if (!supabaseUrl || !supabaseAnon || !serviceKey) {
    return json({ error: "Server configuration incomplete" }, { status: 500 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, { status: 401 });

  const userClient = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user?.id) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const uid = userData.user.id;

  const admin = createClient(supabaseUrl, serviceKey);
  const { row, err } = await loadBookingWithEvent(admin, bookingId);
  if (!row) {
    return json({ error: "Booking not found", detail: err ?? undefined }, { status: 404 });
  }
  if ((row.user_id ?? "").trim() !== uid) {
    return json({ error: "Forbidden" }, { status: 403 });
  }
  if (!isPaidFreeEventBooking(row)) {
    return json({ error: "Booking is not a completed free event reservation" }, { status: 400 });
  }

  if (!n8nUrl) {
    console.warn("[notify-free-reservation] skip: N8N_FREE_RESERVATION_WEBHOOK_URL unset");
    return json({ ok: true as const, notified: false as const, reason: "webhook_not_configured" });
  }

  const ev = row.events!;
  const { firstName, lastName } = splitAttendeeName(row.name);
  const payload = JSON.stringify({
    type: "event_reservation_free_confirmed",
    created_at: new Date().toISOString(),
    booking_id: row.id,
    user_id: uid,
    event: eventPayloadFromRow(ev),
    reservation: {
      firstName,
      lastName,
      email: row.email.trim().toLowerCase(),
      phone: row.phone.trim(),
      tickets: row.tickets,
    },
    payment: null,
  });

  let res: Response;
  try {
    res = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("[notify-free-reservation] n8n fetch failed", bookingId, msg);
    return json({ ok: true as const, notified: false as const, reason: "n8n_unreachable" });
  }

  if (!res.ok) {
    const snippet = (await res.text()).slice(0, 500);
    console.warn("[notify-free-reservation] n8n non-OK", bookingId, res.status, snippet);
    return json({ ok: true as const, notified: false as const, reason: "n8n_error", status: res.status });
  }

  return json({ ok: true as const, notified: true as const });
});
