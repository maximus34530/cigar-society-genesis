import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { handleOptions, json } from "./_shared/cors.ts";
import { sendReceiptEmail } from "./_shared/receipt.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });

  let body: { session_id?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sessionId = body.session_id?.trim();
  if (!sessionId) return json({ error: "session_id is required" }, { status: 400 });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, { status: 401 });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

  if (!supabaseUrl || !supabaseAnon || !serviceKey || !stripeKey) {
    return json({ error: "Server configuration incomplete" }, { status: 500 });
  }

  const userClient = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user?.id) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const uid = userData.user.id;

  const stripe = new Stripe(stripeKey, { httpClient: Stripe.createFetchHttpClient() });
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Stripe error";
    return json({ error: msg }, { status: 502 });
  }

  if (session.payment_status !== "paid") {
    return json({ error: "Payment not completed" }, { status: 400 });
  }
  if (session.metadata?.user_id !== uid) {
    return json({ error: "Forbidden" }, { status: 403 });
  }

  const bookingId = session.metadata?.booking_id;
  if (!bookingId) return json({ error: "Invalid session" }, { status: 400 });

  const admin = createClient(supabaseUrl, serviceKey);
  const amountTotal = session.amount_total ?? 0;
  const totalPaid = amountTotal / 100;
  const pi = session.payment_intent;
  const piId = typeof pi === "string" ? pi : pi?.id ?? null;

  const { error } = await admin
    .from("bookings")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      total_paid: totalPaid,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: piId,
    })
    .eq("id", bookingId)
    .eq("user_id", uid);

  if (error) return json({ error: error.message }, { status: 500 });

  await sendReceiptEmail(admin, bookingId);
  return json({ ok: true });
});
