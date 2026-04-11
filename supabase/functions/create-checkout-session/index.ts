import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { handleOptions, json } from "./_shared/cors.ts";

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
  const siteOrigin = (Deno.env.get("SITE_ORIGIN") ?? "").replace(/\/$/, "");
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

  if (!supabaseUrl || !supabaseAnon || !serviceKey || !stripeKey || !siteOrigin) {
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

  const { data: booking, error: bErr } = await admin
    .from("bookings")
    .select("id,user_id,event_id,tickets,status,email,events(id,name,price,capacity_total)")
    .eq("id", bookingId)
    .maybeSingle();

  if (bErr || !booking) return json({ error: "Booking not found" }, { status: 404 });
  if (booking.user_id !== uid) return json({ error: "Forbidden" }, { status: 403 });
  if (booking.status === "paid") return json({ error: "Already paid" }, { status: 400 });

  const ev = booking.events as
    | { id: string; name: string; price: number | null; capacity_total: number | null }
    | null
    | undefined;
  const event = Array.isArray(ev) ? ev[0] : ev;
  if (!event) return json({ error: "Event not found" }, { status: 400 });

  const unitCents = Math.round(Number(event.price ?? 0) * 100);
  if (!Number.isFinite(unitCents) || unitCents <= 0) {
    return json({ error: "Event is not a paid listing" }, { status: 400 });
  }

  const cap = event.capacity_total;
  if (cap != null && Number.isFinite(Number(cap)) && Number(cap) > 0) {
    const { data: paidRows, error: capErr } = await admin
      .from("bookings")
      .select("tickets")
      .eq("event_id", event.id)
      .eq("status", "paid");

    if (capErr) return json({ error: capErr.message }, { status: 500 });

    const sold = (paidRows ?? []).reduce((s, r) => s + Number((r as { tickets?: number }).tickets ?? 0), 0);
    const need = sold + Number(booking.tickets ?? 0);
    const capN = Number(cap);
    if (need > capN) {
      const left = Math.max(0, capN - sold);
      return json(
        {
          error:
            left <= 0
              ? "This event is sold out."
              : `Only ${left} seat${left === 1 ? "" : "s"} left — reduce tickets and try again.`,
        },
        { status: 409 },
      );
    }
  }

  const stripe = new Stripe(stripeKey, { httpClient: Stripe.createFetchHttpClient() });
  const qty = Math.max(1, Math.trunc(Number(booking.tickets ?? 1)));

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: typeof booking.email === "string" ? booking.email : undefined,
    line_items: [
      {
        quantity: qty,
        price_data: {
          currency: "usd",
          unit_amount: unitCents,
          product_data: {
            name: event.name,
          },
        },
      },
    ],
    success_url:
      `${siteOrigin}/dashboard?checkout=success&booking_id=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteOrigin}/events?checkout=cancelled&event_id=${encodeURIComponent(event.id)}`,
    metadata: {
      booking_id: booking.id,
      user_id: uid,
      event_id: event.id,
      tickets: String(qty),
    },
    payment_intent_data: {
      metadata: {
        booking_id: booking.id,
        user_id: uid,
        event_id: event.id,
      },
    },
  });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Stripe error";
    return json({ error: msg }, { status: 502 });
  }

  if (!session.url) {
    return json({ error: "Stripe did not return a checkout URL" }, { status: 500 });
  }

  const { error: upErr } = await admin
    .from("bookings")
    .update({
      status: "pending_payment",
      stripe_checkout_session_id: session.id,
    })
    .eq("id", booking.id);

  if (upErr) {
    return json({ error: upErr.message }, { status: 500 });
  }

  return json({ checkout_url: session.url });
});
