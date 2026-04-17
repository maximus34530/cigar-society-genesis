# Stripe Payment Processing — Implementation Plan (Phase 2)

Issue: **[#111](https://github.com/maximus34530/cigar-society-genesis/issues/111)**  
Scope: **Event tickets only** (single purchase flow).  
Stack: React (Vite) + Supabase (DB/Auth/Edge Functions) + Stripe Checkout.

---

## Checkout UX — what we’re improving (summary)

We are keeping the **same technical architecture** (booking row → Edge Function → Stripe Checkout → webhook → dashboard finalize), but tightening the **front-of-house** so checkout feels like a premium venue, not a prototype:

- **Clarity before commitment**: on the event, the user always sees what they’re buying (when, where, price, tickets, 21+ if applicable, capacity).
- **Short linear flow**: **Tickets → Attendee details → Pay** (two or three steps max on mobile), with a **persistent order summary** so the user never loses context.
- **Trust at payment**: totals and fees before “Continue to payment”; calm loading states so users don’t double-submit; Apple/Google Pay surfaced when Stripe offers them.
- **Smooth auth handoff**: if login is required, return the user to the **same event** and **resume the same checkout intent** (already a goal of this plan—UX copy and layout should make that obvious).
- **Confident completion**: after pay, land on **Dashboard** with a clear **paid** confirmation, refresh bookings, and optional next actions (view booking, directions) without changing backend truth (webhook remains primary).

Visual and tone details should stay aligned with **`BRANDING_STYLES.md`** (gold accents, dark surfaces, restrained copy).

---

## Desired outcome

### User experience (smooth + modern)
- **Reserve → Pay → Confirmed** in as few steps as possible.
- If user is not logged in, they must **log in/sign up first**, then return to the exact event reservation flow.
- After successful payment, user lands on `/dashboard` with a **clear confirmation** (toast/banner) and sees their booking as **Paid**.
- If Stripe webhook is delayed, the UI still confirms payment via a **redirect finalize fallback** and refreshes the booking list.
- Admin can optionally **cap event capacity** and the system prevents overselling.
- Receipts are sent via a **fully custom n8n email** triggered server-side after payment confirmation.
- **Checkout feels “guided”**: the user always knows which step they’re on, what they’re paying for, and what happens next—without extra marketing noise inside the payment path.

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
  - Processes `checkout.session.completed`, marks bookings `paid`, calls n8n receipt webhook
  - **Ops:** ensure Stripe dashboard endpoint + `STRIPE_WEBHOOK_SECRET` match so logs show **200** (finalize fallback still covers slow webhooks)
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
3. After login/signup, user is sent back to the same event and enters checkout:
   - **Step A — Tickets**: choose ticket quantity; see **subtotal**, **per-ticket price**, and (if capped) **spots remaining** before continuing.
   - **Step B — Details**: first name, last name, phone, email (only fields required for door check-in + receipt); each field has a **one-line “why we ask”** hint where helpful.
   - **Step C — Pay**: user reviews an **order summary** (event title, date/time, ticket count, total); clicks **Continue to payment** once.
4. Stripe Checkout opens (card / Apple Pay / Google Pay).
5. User pays successfully.
6. User is redirected to **Dashboard** with a **thank you / payment confirmed** message.
7. User can always see their ticket booking(s) on **Dashboard** and **Profile**.

**UX guardrails (non-negotiables for “professional”)**
- **No surprise totals**: if there are fees/taxes, they must be visible **before** Stripe Checkout (even if $0 fees, say “Fees included” when true).
- **No double-submit**: disable the primary button while `create-checkout-session` is running; show a lightweight spinner/skeleton on the CTA.
- **Context never disappears**: keep a compact **event header** (thumbnail optional, title, date/time) visible at the top of each checkout step.

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

### UX shell — how the checkout UI should feel (layout + flow)

**Recommended presentation (mobile-first)**  
- Prefer a **full-screen checkout sheet** or a **dedicated checkout route** (ex: `/events/:id/checkout`) over a cramped modal once the user is collecting PII + paying.  
- If you keep a modal for step A only, **promote** to full-screen at step B/C on small breakpoints.

**Step chrome**  
- Add a simple **step indicator**: `Tickets → Details → Pay` (text is fine; no need for heavy UI).  
- Keep a **sticky summary**:
  - Desktop: summary column on the right.
  - Mobile: collapsible **“Order summary”** panel pinned above the primary button.

**Event card / pre-checkout (Events list)**  
Before opening checkout, each event card should answer at a glance:
- **When** (local time + timezone if you ever expand beyond local)
- **Where** (lounge address or “on-site”)
- **Price** (per ticket + total estimate when quantity selected)
- **Policy hooks** (21+ if applicable; refunds link to a short policy page)
- **Capacity** (if capped): “X spots left” + disabled CTA when full

**Attendee form UX**  
- Use large tap targets, correct `autocomplete`, and **inline validation** (errors adjacent to fields).  
- Avoid asking for anything you won’t use on the receipt or at the door.

**Handoff to Stripe**  
- Button copy: **“Continue to secure payment”** (more trustworthy than “Pay”).  
- Secondary text (small): “You’ll complete payment on Stripe.”  
- After redirect, the app should tolerate slow returns: the plan’s **finalize fallback** covers this—UI should say “Finalizing payment…” if needed.

### A) Reserve modal → Checkout
- On “Continue to payment”:
  - Insert booking row with `tickets`, attendee info, etc.
  - Set booking `status = "pending_payment"` for paid events (free events can go straight to `paid`)
  - Invoke `create-checkout-session` with `booking_id`
  - Redirect to returned `checkout_url`
  - If the event is capacity-capped, the UI should show “X spots left” and block booking when full.
- **UX additions (same flow, better execution)**:
  - Split the current “single modal dump” into the **step flow** described above (tickets → details → pay).
  - Add **explicit empty/error states**:
    - Event inactive / not purchasable
    - Sold out / not enough seats for requested tickets
    - Network failure calling Edge Functions (retry + support hint)
  - If the user backs out of Stripe Checkout, keep the booking in `pending_payment` and make “Resume payment” obvious (see section D).

### B) Success redirect UX (`/dashboard?checkout=success&booking_id=...&session_id=...`)
- Show a **success toast/banner** (“Payment confirmed”).
- Immediately refresh bookings list.
- Best-effort: call `finalize-checkout-session` if `session_id` exists.
- Remove query params after processing to avoid re-running on refresh.
- **Optional premium touches (still compatible with this plan)**:
  - A short **“What’s next”** list: “Show this confirmation at the door” / “Check your email for receipt” (n8n) / “Add to calendar” (link)
  - A primary button: **“View my booking”** (scroll to the row / open detail)

### C) Cancel redirect UX (`/events?checkout=cancelled`)
- Show a toast/banner:
  - “Checkout cancelled — your reservation is saved but unpaid.”
- Optionally offer a “Resume payment” button that reuses the existing booking (see next section).
- **UX additions**:
  - If they land on `/events`, **scroll to the same event card** when possible (deep link hash or query), so they don’t feel “lost”.

### D) Resume payment (recommended next UX)
If a booking is `pending_payment`, allow user to:
- Open booking detail (dashboard/profile)
- Click “Complete payment”
- Call `create-checkout-session` again for that `booking_id`
- **UX additions**:
  - Show a **time-sensitive hint** if you later add “hold windows” (optional): “Your seats are reserved for X minutes.”  
  - If you don’t implement holds yet, avoid implying a hold—keep copy honest: “Payment not completed yet.”

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

### UX / interaction
- **Mobile**: verify keyboard doesn’t cover inputs; primary CTA remains reachable; step indicator doesn’t wrap awkwardly.
- **Auth return**: start checkout logged out → login/signup → confirm user returns to the **same event** with **form state preserved** (or clearly re-opened) before payment.
- **Double-click protection**: rapid taps on “Continue to payment” must not create duplicate bookings (disable + spinner).
- **Sold out / not enough seats**: verify messaging is specific (“Only 2 seats left”) vs generic errors.

### Reliability
- Close tab immediately after paying (don’t return to success URL) and verify:
  - Webhook still marks booking `paid`

### Security
- Confirm user cannot:
  - Finalize another user’s session
  - Invoke `create-checkout-session` for someone else’s booking

---

## Remaining work (next steps)

### Ops / hardening (keep verifying)
- **Stripe webhook**: Stripe Dashboard shows **200** for `checkout.session.completed` on the Supabase `…/functions/v1/stripe-webhook` URL; `STRIPE_WEBHOOK_SECRET` matches that endpoint’s signing secret (test vs live keys consistent).
- **Production**: repeat smoke test on live mode before marketing pushes.

### Shipped (Phase 2 payments core — for reference)
- Capacity: `capacity_total`, admin field, Events UI, enforcement in `create-checkout-session`
- Paid receipts: `N8N_RECEIPT_WEBHOOK_URL`, `stripe-webhook` + `finalize-checkout-session`, payload includes nested **`event`** (full listing fields) plus flat `event_*` keys
- Dashboard/Profile: status labels, complete payment, post-checkout finalize + banner
- Admin bookings: status + truncated Stripe session / payment intent ids

### Should-do (polish — optional follow-ups)
- **Checkout UX polish** (if you want it even closer to the “premium venue” bar in this doc):
  - Step indicator + sticky/collapsible order summary
  - “Continue to secure payment” CTA pattern + microcopy pass
  - Stronger empty/error states for edge cases
  - Richer post-pay “What’s next” panel on Dashboard
- **Refunds** (product decision in “Questions” below): admin-triggered refund flow + Stripe + DB sync when you’re ready

### Phase 2 outside this payment slice (see `Phase_2_implementation_plan.md`)
- Open GitHub issues **#107** (signup rate limit / confirm UX) and **#108** (magic link demo) — not Stripe-specific

---

## Questions (quick answers will tighten the plan)
1. **Refunds**: For Phase 2, do you want refunds (admin-triggered) or only record payments?- Admin triggered




My Personal Summary
Big picture
Think of it as three rooms: the website (front end) where people tap buttons, Supabase (back end + database) where the truth about bookings lives, Stripe where the card money happens, and n8n as the messenger that sends emails or other automations when the system says it’s allowed.

Guest: from “I want to go” to “I’m paid”
1. Browsing (front end)
On Events, the site asks Supabase for the list of events (name, date, time, price, how many seats exist, etc.) and shows them in cards. That’s just reading data — like looking at a printed calendar, not buying yet.

2. “Reserve my spot” — step one: tickets (front end)
They pick an event and open the booking flow. Step “tickets” is: how many seats? They see capacity hints (how full it is) so they don’t get surprised later.

3. Step two: details (front end)
Step “details” collects the stuff you need at the door and for receipts: name, phone, email, etc. Still no money — they’re filling out the guest list.

4. Step three: pay — splits into two paths (front + back)
A) Free event (price is zero / free listing)

Front end: When they confirm, the app writes a row in Supabase (bookings) as confirmed/free.
Front end: It can ping n8n using the public webhook URL you put in Vite env (free reservations only — safe because there’s no payment to fake).
Back end: Supabase rules (RLS) still control who can insert what so random people can’t mess with other people’s rows.
B) Paid event

Front end: When they’re ready to pay, the app calls your Edge Function create-checkout-session with “here’s my logged-in user + this booking id.”
Back end (Edge): That function checks: Are they really logged in? Does this booking belong to them? Is it still unpaid? Is there room? Then it asks Stripe for a Checkout link and saves the booking as something like “waiting on payment” with Stripe’s session id attached.
Front end: The user is sent to Stripe’s page (not your site) to enter the card. Your site doesn’t see the card number.
5. After the card (Stripe + back end + front end)
When Stripe says paid, two things can happen (you built both on purpose):

Stripe → your stripe-webhook Edge Function (back end)
Stripe knocks on your door: “Payment finished.” The function checks Stripe’s signature so it’s not a faker, updates the booking to paid in the database, then can call n8n using the secret URL you put in Supabase (N8N_RECEIPT_WEBHOOK_URL) — only after money is real.

User lands on Dashboard (front end)
The return URL includes a session id. The Dashboard calls finalize-checkout-session (back end): “Double-check this Stripe session is paid and attach it to the right user/booking.” That also triggers the same kind of n8n receipt logic if the webhook was slow — so the user isn’t stuck staring at “processing” forever.

So for paid tickets, n8n is not trusted from the browser; it’s triggered from Supabase Edge after payment is confirmed.

6. What the guest sees after (front end)
They see confirmation on Dashboard (and similar info on Profile): paid vs waiting to pay, upcoming event, “check your email” style copy. Email / fancy automation is whatever n8n does with the JSON payload (ticket_receipt_paid, etc.).

Admin: what they see and what “really” happened
Front end (admin UI)
An admin goes to the admin bookings screen. It reads from Supabase the same bookings table (with event info): who booked, how many tickets, status, payment-related ids if you surface them there. They’re basically looking at the ledger your app and Stripe already agreed on.

Back end (what they’re trusting)
Bookings live in Postgres behind Supabase.
Paid is not “the user said they paid”; it’s “Stripe webhook and/or finalize updated the row to paid with real session/payment data.”
Receipt / post-payment n8n runs from Edge with the secret n8n URL — so a random person in the browser can’t fire “paid receipt” for someone else’s booking.
One sentence per “actor”
Piece	In dummy terms
Events page
Window shopping → pick seats → fill details → either save free booking or jump to Stripe for paid.
Supabase
The notebook that remembers every booking and who owns it.
Edge Functions
Bouncers + cashiers: verify the user, talk to Stripe, update the notebook, call n8n when rules say so.
Stripe
The actual card machine; your site never holds the card.
n8n (paid)
The backstage crew that sends the “you’re in” email after the server knows payment succeeded.
n8n (free)
Can be pinged from the browser after a free reservation is saved — different URL, different risk profile.
Admin
Reads the same notebook to see who’s coming and in what state.
That’s the full loop: click event → steps → database row → (if paid) Stripe → webhooks/finalize update truth → n8n from the server → guest sees Dashboard + email from n8n → admin sees bookings in the admin UI.

