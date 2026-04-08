# Stripe Payment Processing — Implementation Plan (Phase 2)

Issue: **[#111](https://github.com/maximus34530/cigar-society-genesis/issues/111)**  
Scope: **Event tickets only** (single purchase flow).  
Stack: React (Vite) + Supabase (DB/Auth/Edge Functions) + Stripe Checkout.

---

## Desired outcome

### User experience (smooth + modern)
- **Reserve → Pay → Confirmed** in as few steps as possible.
- If user is not logged in, they must **log in/sign up first**, then return to the exact event reservation flow.
- After successful payment, user lands on `/dashboard` with a **clear confirmation** (toast/banner) and sees their booking as **Paid**.
- If Stripe webhook is delayed, the UI still confirms payment via a **redirect finalize fallback** and refreshes the booking list.
- Admin can optionally **cap event capacity** and the system prevents overselling.
- Receipts are sent via a **fully custom n8n email** triggered server-side after payment confirmation.

### Backend truth
For each paid checkout, the matching `bookings` row in Supabase is updated with:
- `status = "paid"`
- `paid_at` set
- `total_paid` set
- `stripe_checkout_session_id` set
- `stripe_payment_intent_id` set (when available)

---

## Current state (already implemented)

### Database
- `bookings` includes payment tracking fields:
  - `status` (currently used values include `pending_payment` and `paid`)
  - `stripe_checkout_session_id`
  - `stripe_payment_intent_id`
  - `paid_at`
  - (plus other fields used by reservations like `tickets`, `email`, etc.)

### Supabase Edge Functions
- **`create-checkout-session`**
  - Validates requester owns the booking
  - Reads event + price
  - Creates a Stripe Checkout Session
  - Updates booking → `pending_payment`
  - Returns `checkout_url`
  - Success redirect includes `booking_id` and (now) `session_id={CHECKOUT_SESSION_ID}`
- **`stripe-webhook`**
  - Intended to process Stripe events (ex: `checkout.session.completed`) and mark bookings paid
  - Was observed returning **400** in logs; needs end-to-end verification (see “Remaining work”)
- **`finalize-checkout-session`**
  - UX safety net on redirect
  - Given a `session_id` (and a signed-in user JWT), retrieves session from Stripe
  - Confirms `payment_status === "paid"`
  - Updates the user’s booking row to `paid`

### Frontend
- Events flow creates a booking row, then calls `create-checkout-session` and navigates user to Stripe Checkout.
- Dashboard detects `?checkout=success` and triggers finalize + refresh (best-effort).

---

## Dumbed-down, step-by-step flow (what the user sees + where data goes)

### What the user sees
1. User opens **Events** page and clicks **Reserve / Buy tickets** on an event.
2. If not logged in, user is sent to **Login / Signup**.
3. After login/signup, user is sent back to the same event and fills out:
   - First name, last name, phone, email, number of tickets
4. User clicks **Continue to payment**.
5. Stripe Checkout opens (card / Apple Pay / Google Pay).
6. User pays successfully.
7. User is redirected to **Dashboard** with a **thank you / payment confirmed** message.
8. User can always see their ticket booking(s) on **Dashboard** and **Profile**.

### How the data moves (visual)

```mermaid
flowchart TD
  A[Admin creates/edits event in Supabase] --> B[Events page reads event from Supabase]
  B --> C{User logged in?}
  C -- No --> D[Login/Signup]
  D --> B
  C -- Yes --> E[User submits reservation form]
  E --> F[Insert booking in Supabase: status=pending_payment]
  F --> G[Invoke Edge Function: create-checkout-session]
  G --> H[Stripe Checkout Session created (dynamic price_data)]
  H --> I[User pays in Stripe]
  I --> J[Stripe sends webhook: checkout.session.completed]
  J --> K[Edge Function: stripe-webhook updates booking status=paid]
  K --> L[Edge Function calls n8n webhook to send custom receipt]
  I --> M[User redirected to /dashboard?checkout=success&session_id=...]
  M --> N[Dashboard invokes finalize-checkout-session (fallback) + refresh]
```

**Important reliability note**
- The webhook path (Stripe → `stripe-webhook`) is what makes payments reliable even if the user closes the tab.
- The redirect finalize fallback is UX insurance if webhook delivery is delayed.

---

## Payment lifecycle (state machine)

### Booking states (recommended)
Use a small, explicit set of values for `bookings.status`:
- `reserved` (optional): created but not sent to Stripe yet
- `pending_payment`: Stripe Checkout session created, payment not confirmed yet
- `paid`: confirmed payment (webhook or finalize fallback)
- `cancelled`: user cancelled a booking in-app (separate from Stripe “cancelled checkout”)
- `payment_cancelled` (optional): user backed out of Stripe Checkout
- `payment_failed` (optional): Stripe payment failed or expired

**Source of truth**
- Primary: **Stripe webhook** (`checkout.session.completed`)
- Secondary fallback: **redirect finalize** on `/dashboard?checkout=success`

---

## Frontend implementation details (what we want)

### A) Reserve modal → Checkout
- On “Continue to payment”:
  - Insert booking row with `tickets`, attendee info, etc.
  - Set booking `status = "pending_payment"` for paid events (free events can go straight to `paid`)
  - Invoke `create-checkout-session` with `booking_id`
  - Redirect to returned `checkout_url`
  - If the event is capacity-capped, the UI should show “X spots left” and block booking when full.

### B) Success redirect UX (`/dashboard?checkout=success&booking_id=...&session_id=...`)
- Show a **success toast/banner** (“Payment confirmed”).
- Immediately refresh bookings list.
- Best-effort: call `finalize-checkout-session` if `session_id` exists.
- Remove query params after processing to avoid re-running on refresh.

### C) Cancel redirect UX (`/events?checkout=cancelled`)
- Show a toast/banner:
  - “Checkout cancelled — your reservation is saved but unpaid.”
- Optionally offer a “Resume payment” button that reuses the existing booking (see next section).

### D) Resume payment (recommended next UX)
If a booking is `pending_payment`, allow user to:
- Open booking detail (dashboard/profile)
- Click “Complete payment”
- Call `create-checkout-session` again for that `booking_id`

---

## Backend implementation details (what we want)

### 1) Stripe Checkout session creation (`create-checkout-session`)
Checklist:
- Ensure success URL includes:  
  `session_id={CHECKOUT_SESSION_ID}` and `booking_id=<uuid>`
- Ensure metadata includes:
  - `booking_id`
  - `user_id`
  - `event_id`
  - `tickets`
- Update booking:
  - `status = "pending_payment"`
  - `stripe_checkout_session_id = <session.id>`

**Dynamic price data (approved approach)**
- Do **not** create/manage Stripe Products for events.
- Create the Checkout session with:
  - `line_items[].price_data.product_data.name = event.name`
  - `line_items[].price_data.unit_amount = event.price * 100`
  - `quantity = tickets`

### 2) Stripe webhook (`stripe-webhook`) — primary reliability
Webhook should:
- Verify signature using the **raw** request body and `STRIPE_WEBHOOK_SECRET`
- On `checkout.session.completed`:
  - Read `booking_id` from `session.metadata`
  - Update booking to:
    - `status = "paid"`
    - `paid_at = now()`
    - `total_paid = amount_total/100`
    - store Stripe IDs
- Return **200** quickly (don’t do heavy work)

**n8n receipt (custom email)**
- After marking the booking `paid`, trigger a **server-side** call to n8n:
  - This should happen from `stripe-webhook` (primary) and optionally also from `finalize-checkout-session` (fallback).
- Payload should include:
  - booking id, event id/name/date/time
  - attendee name/email/phone
  - tickets
  - total_paid
  - Stripe session id + payment intent id
- Use a new secret:
  - `N8N_RECEIPT_WEBHOOK_URL` (Edge Function secret; never exposed client-side)

### 3) Redirect finalize fallback (`finalize-checkout-session`)
Finalize should:
- Require user JWT (so users can’t finalize someone else)
- Retrieve Stripe session by `session_id`
- Verify:
  - `payment_status === "paid"`
  - `metadata.user_id === auth.uid()`
- Update that booking to `paid`

### 4) Event capacity (cap + enforcement)

#### Data model (recommended)
Add to `events`:
- `capacity_total` (int, nullable) — max tickets allowed for the event

Booking contributes `tickets` toward capacity when:
- `status = "paid"` (**Chosen approach / Option 1**)

Trade-off:
- This can **oversell** in rare cases if multiple users are paying at the same time for the last remaining spots.
- If this becomes a real issue, upgrade later to a short “hold window” that also counts recent `pending_payment` bookings.

#### Enforcement location (recommended)
Enforce capacity in **Edge Function `create-checkout-session`** (server-side).

High-level algorithm:
- Read `events.capacity_total`
- Compute `tickets_sold = sum(bookings.tickets)` for that event where `status = 'paid'`
- Ensure `tickets_sold + booking.tickets <= capacity_total`
- If full, return 409 with a friendly error for the UI

Optional “hold” strategy (later):
- If you want to prevent two users from checking out simultaneously for the last seats, implement a short “hold” window:
  - count `pending_payment` bookings younger than X minutes
  - expire holds when they age out

---

## Supabase + Stripe configuration

### Required Edge Function secrets (Supabase)
In Supabase Function secrets:
- `STRIPE_SECRET_KEY` (Stripe test secret key)
- `STRIPE_WEBHOOK_SECRET` (from Stripe dashboard for the specific endpoint)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `SITE_ORIGIN` (local/dev/prod; used for redirect URLs)
- `N8N_RECEIPT_WEBHOOK_URL` (server-side only; used to send custom receipt emails)

### Stripe webhook endpoint (must be correct)
In Stripe Dashboard → Developers → Webhooks:
- Endpoint should point to Supabase Functions URL for the project, using the v1 path:
  - `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`
- Events to send (minimum):
  - `checkout.session.completed`

---

## Testing plan (dev + Stripe test mode)

### Functional
- Create a paid event, reserve with 1–3 tickets, pay using Stripe test card, verify:
  - Booking becomes `paid`
  - `paid_at` populated
  - `total_paid` correct (\(unit\_price \times tickets\))
  - Stripe IDs saved
- Cancel checkout and verify:
  - Booking remains `pending_payment` (or moves to `payment_cancelled` if implemented)
  - UI shows helpful message and allows retry

### Reliability
- Close tab immediately after paying (don’t return to success URL) and verify:
  - Webhook still marks booking `paid`

### Security
- Confirm user cannot:
  - Finalize another user’s session
  - Invoke `create-checkout-session` for someone else’s booking

---

## Remaining work (next steps)

### Must-do (to finish payments)
- Fix/verify `stripe-webhook` end-to-end:
  - Confirm Stripe endpoint URL matches Supabase function path
  - Confirm `STRIPE_WEBHOOK_SECRET` matches that endpoint’s signing secret
  - Confirm webhook returns **200** for `checkout.session.completed`
- Add event capacity support:
  - Add `events.capacity_total`
  - Add admin UI field (“Capacity cap”) + display spots remaining
  - Enforce in `create-checkout-session`
- Add server-side n8n receipt webhook:
  - Configure `N8N_RECEIPT_WEBHOOK_URL` secret
  - Trigger from `stripe-webhook` (and optionally `finalize-checkout-session`)

### Should-do (polish)
- Add UI labels for bookings:
  - Paid / Pending payment / Cancelled
- Add “Complete payment” for `pending_payment` bookings.
- Admin: show payment status + Stripe IDs in `AdminBookings`.

---

## Questions (quick answers will tighten the plan)
1. **Refunds**: For Phase 2, do you want refunds (admin-triggered) or only record payments?

