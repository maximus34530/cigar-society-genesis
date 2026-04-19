# Phase 5 — Membership & Community — Implementation Plan

**Project**: Cigar Society Genesis (`cigar-society-genesis`)
**Business**: Cigar Society, LLC — 116 W State Ave, Pharr, TX 78577 — (956) 223-1303
**Tracking issue**: [#181](https://github.com/maximus34530/cigar-society-genesis/issues/181)
**Working branch**: `Phase-5-(Memberships)`
**Status**: **Active** — follows the “skip to membership” directive from the owner.
**Companion docs**:
`GITHUB_ISSUES_GUIDE.md`, `IMPLEMENTATION_PLAN.md`, `Phase_2_implementation_plan.md`, `Stripe_Payment_Implementation_Plan.md`, `Manage_Account_Implementation_Plan.md`, `BRANDING_STYLES.md`, `docs/CLIENT_PRICING_AND_TIMELINE.md`

---

## 0. Phase naming & proposal mapping

The client-facing proposal PDF (`CigarSociety Proposal.pdf`) calls this work **“Phase 4 — Membership & Accounts ($1,250 / 1–2 weeks)”**. The repo’s internal roadmap (`IMPLEMENTATION_PLAN.md §Future Roadmap`) labels the same scope **“Phase 5 — Membership & Community.”** This document uses the repo name **Phase 5** to stay consistent with the rest of the guides.

**Line-item mapping (PDF → this plan)**

| PDF line item | Price | Owned here by |
|---|---|---|
| Membership page (front end) | $250 | Epic B |
| Login page + user dashboard (front end) | $250 | Already delivered in Phase 2 (`src/pages/Login.tsx`, `src/pages/Signup.tsx`, `src/pages/Dashboard.tsx`, `src/pages/Account.tsx`) — Epic D only *extends* it |
| Membership (back end) | $250 | Epic A + Epic C |
| User dashboard + database (back end) | $250 | Epic A + Epic D |
| Stripe updated for membership billing | Included | Epic C |
| Admin panel updated — membership | Included | Epic F |
| **Phase total** | **$1,250** | |

---

## 1. Goals (what “done” looks like)

By the end of Phase 5:

1. **Public membership page** at `/membership` (or `/la-sociedad`) — explains tiers, perks, and price; has a single clear CTA (“Become a member”).
2. **Paid subscription flow** — signed-in users can purchase a monthly subscription via **Stripe Subscriptions** (separate from event-ticket checkout).
3. **Member state in Supabase** — a durable record of each user’s subscription (plan, status, renewal date, Stripe IDs), kept in sync with Stripe via webhooks + a redirect-finalize fallback (same reliability pattern as tickets).
4. **Dashboard reflects membership** — `src/pages/Dashboard.tsx` shows plan, next renewal, and a link into the Stripe Customer Portal for manage/cancel.
5. **Gating primitives** — a single, reusable way to check `isMember(user)` and optionally gate UI (perks, future member-only events, discount hints).
6. **Admin visibility** — `src/pages/Admin.tsx` gets a **Members** tab: list + status filter; cancel/refund is *out of scope* for v1 of this phase (handled via Stripe dashboard).
7. **Email touchpoints** — welcome, receipt on renewal, cancellation notice — sent via the existing **n8n** pattern from server side (never from the browser).

**Explicitly on hold / out of scope for Phase 5**:

- Physical/printed member cards, NFC/QR check-in at the door.
- POS / in-store terminal integration.
- Member-only ticket pricing automation (flagged in Epic E for later; Phase 5 can show a badge but not discount).
- Annual vs. monthly toggle (stick to one cadence at launch unless owner decides otherwise — see §8 open questions).
- Referrals, loyalty points, gifting memberships.
- Native apps.

---

## 2. Guiding principles

- **Reuse, don’t reinvent.** Stripe Subscriptions reuses the same Edge Function *pattern* as `supabase/functions/create-checkout-session` and `stripe-webhook`. Do **not** fork the ticket function; create a **new** function `create-subscription-checkout-session` so ticket flows stay stable.
- **Server is the source of truth.** Subscription state comes from **Stripe webhooks** (`customer.subscription.*`, `invoice.*`). The browser never writes `status = active` directly.
- **Never expose secrets client-side.** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `N8N_MEMBERSHIP_WEBHOOK_URL` stay in Supabase Function secrets. Only publishable / anon / `VITE_*` values may ship to the client.
- **Frontend-first per Epic.** Build the membership page + dashboard hooks against a mock before wiring Stripe, to keep PRs small (matches the Phase 2 playbook).
- **RLS everywhere.** `memberships` must be readable only by the owning user and admins; never by anon.
- **One GitHub issue per thin slice.** No orphan commits. Branch stays `Phase-5-(Memberships)` per `GITHUB_ISSUES_GUIDE.md` (fixed working branch).
- **Brand consistency.** All new UI uses the brown/gold palette and surfaces from `BRANDING_STYLES.md`; reuse `shadcn/ui` primitives.

---

## 3. Prerequisites (Phase 2 assumptions)

Phase 5 is being worked on **ahead of** a full Phase 2 closeout. Before wiring Stripe to subscriptions, confirm each of these exists and is healthy on the `Phase-5-(Memberships)` branch:

| Prereq | Status in repo (as of this plan) | If missing |
|---|---|---|
| Supabase Auth (email/password + Google OAuth) | `src/pages/Login.tsx`, `src/pages/Signup.tsx`, `src/pages/AuthCallback.tsx` exist | Build before Epic C — membership requires a logged-in user |
| `profiles` table with `role`, `first_name`, `last_name`, `phone` | Migration `20260415194500_profiles_personal_info_fields.sql` present | Run the referenced migration first |
| Admin role check + admin shell | `src/pages/Admin.tsx` and `src/pages/admin/` exist | Build admin gate before Epic F |
| Stripe Edge Function pattern + webhook wiring | `supabase/functions/create-checkout-session`, `stripe-webhook`, `finalize-checkout-session` exist | Duplicate the *pattern*, not the logic, for subscriptions |
| n8n webhook pattern for server-side email | `N8N_RECEIPT_WEBHOOK_URL` pattern in `Stripe_Payment_Implementation_Plan.md §n8n receipt` | Mirror it with a new `N8N_MEMBERSHIP_WEBHOOK_URL` |
| Dashboard + Account pages | `src/pages/Dashboard.tsx`, `src/pages/Account.tsx` exist | Required — Epic D extends them |

> If any row above is red when an Epic starts, open a blocker issue and resolve it before continuing. Do not mock around missing auth — too much of Phase 5’s correctness depends on `auth.uid()`.

---

## 4. Recommended work order (Epics)

### Epic A — Data model & RLS

**Purpose**: A durable, tamper-resistant record of every user’s subscription, joined by `user_id`.

**Schema (new migration, names are proposals — lock in the issue):**

```sql
-- memberships: one row per user per subscription lifecycle
create table public.memberships (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid not null references auth.users(id) on delete cascade,
  plan                        text not null,                           -- e.g. 'la_sociedad_monthly'
  status                      text not null,                           -- see state machine in §5
  current_period_start        timestamptz,
  current_period_end          timestamptz,
  cancel_at_period_end        boolean not null default false,
  stripe_customer_id          text,
  stripe_subscription_id      text unique,
  stripe_price_id             text,
  last_invoice_id             text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index memberships_user_id_idx on public.memberships(user_id);
create index memberships_status_idx  on public.memberships(status);

alter table public.memberships enable row level security;

-- Policies (sketch — refine in migration):
-- 1) Users can SELECT their own membership rows.
-- 2) Admins (role = 'admin' on profiles) can SELECT all.
-- 3) INSERT/UPDATE happen ONLY via service role (Edge Functions); no client writes.
```

**Profile hook-up**: keep a lightweight **derived view** or helper RPC `is_active_member(uid uuid) returns boolean` so UI gating doesn’t depend on join logic scattered across the client.

**Exit criteria**

- [ ] Migration file committed under `supabase/migrations/` with timestamp prefix and descriptive name.
- [ ] RLS enabled; anon cannot read memberships; user reads only their rows; admin reads all.
- [ ] `is_active_member` helper (view or RPC) reviewed and smoke-tested.
- [ ] No client code has `SUPABASE_SERVICE_ROLE_KEY`.

---

### Epic B — Public Membership page (`/membership`)

**Purpose**: The marketing surface that explains “La Sociedad” membership and sends the user into checkout.

**Suggested structure (single-page, mobile-first):**

1. Hero — headline, one-line pitch, price, single CTA.
2. Perks grid — 3–6 short benefits (owner to provide final list — see §8).
3. FAQ — 4–6 entries (cancel anytime, who it’s for, 21+ reminder, taxes/fees).
4. Footer CTA — same primary button as hero.

**Notes**

- Route is added to `src/App.tsx` and to the navbar **only after content is finalized** (so we don’t promote a broken page). Before that, keep it reachable via direct URL.
- Copy stays in the TSX file for now; no CMS.
- Use `react-helmet-async` `Seo` per route, matching other pages.
- Tone stays on-brand with `BRANDING_STYLES.md` (gold on dark, restrained, premium).

> **Live deviation (#199)**: The `Membership` navbar link was added pre-Stripe as a deliberate marketing surface. The page itself is non-broken — hero, perks, FAQ, 21+ attestation, and auth routing all work; the Subscribe CTA surfaces a "coming soon" toast for logged-in non-members until Epic C (#184) ships. Revisit once Stripe is live to confirm the page reads as finished rather than pending.

**Exit criteria**

- [ ] Page renders on mobile and desktop, lazy-loaded like other routes.
- [ ] CTA: if logged out → send to `/login?return=/membership/checkout`; if logged in and **not** a member → send to checkout (Epic C); if already a member → send to `/dashboard#membership`.
- [ ] Lighthouse a11y: no obvious regressions vs. other pages.

---

### Epic C — Stripe Subscriptions flow (new Edge Function)

**Purpose**: Turn a “Become a member” click into a paid, webhook-confirmed subscription row.

**New Edge Function: `create-subscription-checkout-session`**

Modeled on `supabase/functions/create-checkout-session` but:

- Requires a signed-in user (JWT). Reject anon.
- Resolves or creates a Stripe **Customer** for that user; caches `stripe_customer_id` on `memberships` (and/or on `profiles`).
- Creates a Stripe **Checkout Session** in `mode: 'subscription'` with `line_items: [{ price: STRIPE_PRICE_ID_MONTHLY, quantity: 1 }]`.
- Success URL: `${SITE_ORIGIN}/dashboard?membership=success&session_id={CHECKOUT_SESSION_ID}`.
- Cancel URL: `${SITE_ORIGIN}/membership?membership=cancelled`.
- Sets `metadata.user_id` so the webhook can tie the subscription back to our user even before the row exists.

**Webhook work — extend `supabase/functions/stripe-webhook`** (single endpoint keeps Stripe config simple):

Handle these events in addition to existing ticket events:

- `checkout.session.completed` — when `mode === 'subscription'`, upsert a `memberships` row with `status`, Stripe IDs, period timestamps.
- `customer.subscription.updated` — sync `status`, `cancel_at_period_end`, `current_period_*`, `stripe_price_id`.
- `customer.subscription.deleted` — mark `status = 'canceled'` (and/or move to a history table if we decide we want one).
- `invoice.paid` — update `last_invoice_id`, push a renewal event to n8n.
- `invoice.payment_failed` — set `status = 'past_due'`, push a dunning event to n8n.

**Redirect-finalize fallback — new Edge Function: `finalize-subscription-session`**

Mirror `finalize-checkout-session` exactly:

- Requires user JWT.
- Retrieves Stripe session; verifies `payment_status === 'paid'` and `metadata.user_id === auth.uid()`.
- Upserts the `memberships` row if the webhook hasn’t landed yet.

**Exit criteria**

- [ ] Live subscribe → webhook → `memberships` row goes `active` with correct period dates.
- [ ] Closing the tab immediately after paying still ends in an `active` row (webhook reliability).
- [ ] `invoice.payment_failed` flips status to `past_due` and triggers the dunning n8n payload.
- [ ] No `STRIPE_SECRET_KEY` in `src/` or any `VITE_*` env.

---

### Epic D — Member dashboard + account surfacing

**Purpose**: A signed-in member should instantly see their plan, next renewal, and have a one-click way to manage/cancel.

**Changes**

- `src/pages/Dashboard.tsx` — add a **Membership** card above the bookings list:
  - If member: plan label, status pill (`Active`/`Past due`/`Cancels on <date>`), next renewal date.
  - “Manage billing” button → calls new Edge Function `create-portal-session` → redirects to **Stripe Customer Portal** (update card, cancel, view invoices).
  - If **not** member: a small CTA linking to `/membership`.
- `src/pages/Account.tsx` — add a read-only **Membership** row under “Security & sign-in” showing current plan + link to dashboard card (don’t duplicate controls).
- After successful checkout, the success banner handled on `/dashboard?membership=success` mirrors the event-payment banner pattern in `Stripe_Payment_Implementation_Plan.md §B`.

**Exit criteria**

- [ ] Dashboard reflects membership within ~2s of a successful webhook (or immediately via finalize fallback).
- [ ] Customer Portal opens in a new tab, returns cleanly to `/dashboard`.
- [ ] Cancellation reflected on the next load (`cancel_at_period_end = true`, status still `active` until period end).

---

### Epic E — Member gating primitives

**Purpose**: One clean place to ask “is this user a member?” so feature gates stay consistent.

**Suggestion**

- Add a hook: `src/hooks/useMembership.ts` → returns `{ status, isActive, currentPeriodEnd, plan }` backed by a TanStack Query call to a view/RPC from Epic A.
- Add a tiny component: `<MemberOnly fallback={...}>children</MemberOnly>` for UI gating.
- No server-side gating for features that don’t yet exist — **do not** retroactively gate old Phase 2 content.

**Exit criteria**

- [ ] Hook returns fast (<50ms on warm cache) and revalidates on auth change.
- [ ] `<MemberOnly>` has a sane default fallback (“Join La Sociedad to unlock”) with a link to `/membership`.

---

### Epic F — Admin visibility

**Purpose**: Staff can see who’s a member without logging into Stripe for every question.

**Changes**

- `src/pages/Admin.tsx` — add a **Members** tab next to Events/Bookings.
- Read-only table: user email, plan, status, period end, Stripe customer link (opens Stripe dashboard in a new tab).
- Filter by status (`active`, `past_due`, `canceled`).
- **No** admin-triggered cancel/refund in v1 — direct admins to Stripe dashboard. (Can be revisited in a later Epic.)

**Exit criteria**

- [ ] Admin table shows the same rows Stripe shows (spot-check 3 users).
- [ ] RLS: a non-admin hitting the admin API path returns empty / 403, not a user’s own row.

---

### Epic G — n8n notifications (server-side only)

**Purpose**: Keep email / messaging flexible and out of the browser.

**New secret (Supabase function secret, never `VITE_*`)**

- `N8N_MEMBERSHIP_WEBHOOK_URL`

**Payloads (one event type per Stripe event we care about):**

- `membership_welcome` — on first `checkout.session.completed` (mode=subscription).
- `membership_renewed` — on `invoice.paid` (except the first one, which welcome covers).
- `membership_past_due` — on `invoice.payment_failed`.
- `membership_canceled` — on `customer.subscription.deleted` *or* when `cancel_at_period_end` flips true (decide one, document it in the issue).

Each payload includes: `user_id`, `email`, `first_name` / `last_name`, `plan`, `status`, `current_period_end`, `stripe_customer_id`, `stripe_subscription_id`, `last_invoice_id`, `amount_paid`.

**Exit criteria**

- [ ] All four events fire in test mode with a visible n8n log.
- [ ] No n8n call is made from the browser for membership flows.

---

## 5. Payment lifecycle (state machine)

`memberships.status` uses Stripe’s canonical values so mapping stays trivial:

- `incomplete` — checkout started but not yet paid.
- `trialing` — if a trial is ever offered (not in v1 unless owner asks).
- `active` — good standing.
- `past_due` — last invoice failed; retries ongoing.
- `unpaid` — dunning exhausted; access should be treated like `canceled`.
- `canceled` — subscription ended.

**Source of truth priority**
1. Stripe webhook (`customer.subscription.*`, `invoice.*`).
2. Redirect-finalize fallback (`finalize-subscription-session`) on `/dashboard?membership=success`.
3. Never the browser alone.

**UI rule of thumb**: treat anything other than `active` / `trialing` as “not a member” for gating purposes, even if `current_period_end` is still in the future (except when `cancel_at_period_end = true` + status `active` — those users are still members until the period ends).

---

## 6. Stripe & Supabase configuration checklist

### Stripe dashboard (test mode first)

- [ ] One **Product**: “La Sociedad Membership” (or final name).
- [ ] One **Price** (monthly, USD). Capture the `price_id`.
- [ ] Customer Portal configured: allow update payment method, cancel, download invoices.
- [ ] Webhook endpoint `https://<project-ref>.supabase.co/functions/v1/stripe-webhook` subscribed to:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
- [ ] Reuse the **same webhook secret** already used for tickets *only if* both flows hit the same endpoint. Otherwise, split and add a second secret.

### Supabase Edge Function secrets (server-only)

- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_PRICE_ID_MONTHLY` (Phase 5 adds this one)
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SITE_ORIGIN`
- [ ] `N8N_RECEIPT_WEBHOOK_URL` (existing, ticket receipts)
- [ ] `N8N_MEMBERSHIP_WEBHOOK_URL` (new)

### Vercel (production) env

- [ ] All `VITE_*` values unchanged (no secrets added to the browser bundle).

---

## 7. Suggested GitHub issue breakdown

Create one issue per slice, each referencing Phase 5 and this document. Commit format stays `[#ID] message`.

1. `[Backend] Phase 5 — memberships schema + RLS + is_active_member helper` (Epic A)
2. `[Feature] Phase 5 — /membership page (static content + CTA logic)` (Epic B)
3. `[Backend] Phase 5 — create-subscription-checkout-session Edge Function` (Epic C)
4. `[Backend] Phase 5 — extend stripe-webhook for subscription events` (Epic C)
5. `[Backend] Phase 5 — finalize-subscription-session fallback` (Epic C)
6. `[Backend] Phase 5 — create-portal-session Edge Function (Stripe Customer Portal)` (Epic D)
7. `[Feature] Phase 5 — dashboard membership card + success banner` (Epic D)
8. `[Feature] Phase 5 — Account page membership row` (Epic D)
9. `[Feature] Phase 5 — useMembership hook + <MemberOnly /> primitive` (Epic E)
10. `[Feature] Phase 5 — Admin members tab (read-only)` (Epic F)
11. `[Backend] Phase 5 — n8n membership webhook wiring + payloads` (Epic G)
12. `[Docs] Phase 5 — update IMPLEMENTATION_PLAN.md with live status` (post-delivery)

Each issue must include: Objective, Acceptance Criteria, Definition of Done, Technical Notes (per `GITHUB_ISSUES_GUIDE.md §Issue structure template`).

---

## 8. Open product decisions (capture per-issue)

These need an owner decision before they freeze; the technical plan assumes the **bold** default but the issue should re-confirm.

1. **Price point** — $/month. **Default: single monthly tier, $TBD.**
2. **Trial period** — **Default: no trial at launch.**
3. **Annual option** — **Default: monthly only at launch; annual is a later issue.**
4. **Perks list** — What members actually get. **Default pending owner input**; marketing page will ship with a short starter list.
5. **Refund policy** — **Default: no pro-rated refunds; cancel → access through period end.** Admin handles edge cases in Stripe directly.
6. **21+ attestation** — Do we require a checkbox at checkout like tickets? **Default: yes, lightweight attestation checkbox on `/membership` before redirecting to Stripe.**
7. **Event discounts for members** — **Default: not automated in Phase 5.** Track as a Phase 6 enhancement.
8. **Tax** — Use Stripe Tax? **Default: off for v1.** Revisit with owner + CPA.

---

## 9. Reliability & testing plan

Mirrors the ticket plan but for subscriptions.

**Functional (Stripe test mode)**

- [ ] New user signs up → subscribes → `memberships` row `active`, period dates correct, Stripe IDs populated.
- [ ] Existing user upgrades/downgrades price — `customer.subscription.updated` handled.
- [ ] User cancels in Customer Portal — `cancel_at_period_end = true`, status stays `active` until period end, then flips to `canceled` on `customer.subscription.deleted`.
- [ ] Card decline simulation — `invoice.payment_failed` → `past_due` → n8n dunning fires.

**UX**

- [ ] Logged-out CTA on `/membership` routes through login/signup and returns to checkout.
- [ ] Dashboard post-checkout banner shows once and clears the query params.
- [ ] Portal round-trip returns to `/dashboard` cleanly.

**Reliability**

- [ ] Closing the tab immediately after paying still ends in `active` via webhook.
- [ ] Finalize fallback upserts correctly when webhook is artificially delayed.

**Security**

- [ ] User cannot read another user’s membership.
- [ ] User cannot call `create-subscription-checkout-session` with someone else’s `user_id` in metadata (server ignores client-supplied user_id and uses JWT).
- [ ] Admin read requires admin role; no anon access.

---

## 10. Definition of Done (Phase 5, rolling)

When closing Phase 5 issues, require:

- [ ] Production build passes (`npm run build`).
- [ ] No new `console.log` in production paths.
- [ ] Mobile + desktop sanity check on any touched route.
- [ ] RLS / auth decisions documented in the issue (or here) for anything touching data.
- [ ] `[#ID] …` commit format followed; no direct pushes to `main`.
- [ ] Owner approved commit + sync to `Phase-5-(Memberships)` per `GITHUB_ISSUES_GUIDE.md`.

---

## 11. Out of scope (explicit)

- Physical member cards / NFC / QR door check-in.
- POS integration; in-store member lookup terminal.
- Automated member-only event pricing (gate UI only; discount logic deferred).
- Gifting, referrals, loyalty points.
- Multi-tenant / franchise memberships.
- Full internationalization (page stays English for launch).

---

## 12. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Webhook endpoint mis-signed or wrong secret | Reuse the verified ticket webhook; add explicit logging on `stripe-signature` failures; confirm **200** in Stripe dashboard before launch. |
| User double-subscribes | `stripe_subscription_id` is `unique` on `memberships`; `create-subscription-checkout-session` refuses when an `active` / `trialing` row already exists. |
| Tax / legal surprises | `Stripe Tax` off by default; owner + CPA sign-off before live mode. |
| Owner copy not ready | Ship `/membership` with placeholder perks behind a feature flag; do not add to navbar until copy is approved. |
| Scope creep into Phase 6 (events) | Keep “member event discounts” as a Phase 6 issue; Phase 5 only surfaces the badge, not the discount math. |

---

## 13. Timeline target

Per the proposal PDF: **1–2 weeks**, **$1,250**. Realistic internal target on the `Phase-5-(Memberships)` branch, with one dev:

- Week 1: Epics A + B + C (schema, page, subscribe flow to `active`).
- Week 2: Epics D + E + F + G (dashboard/account surfacing, gating primitive, admin tab, n8n payloads), QA + owner review.

Add ~20% buffer for Stripe config and owner copy iteration, as noted in `docs/CLIENT_PRICING_AND_TIMELINE.md`.
