import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { sendReceiptEmail } from "./_shared/receipt.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const sig = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!sig || !webhookSecret || !stripeKey || !supabaseUrl || !serviceKey) {
    return new Response("Webhook misconfigured", { status: 500 });
  }

  const body = await req.text();
  const stripe = new Stripe(stripeKey, { httpClient: Stripe.createFetchHttpClient() });

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceKey);

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;
    if (!bookingId) {
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

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
      .eq("id", bookingId);

    if (error) {
      return new Response(error.message, { status: 500 });
    }

    await sendReceiptEmail(admin, bookingId);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
