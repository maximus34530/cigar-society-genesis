# Onboarding Plan — Cigar Society (Commerce & Beyond)

**Purpose:** Step-by-step process to move from the current marketing site to **admin**, **marketplace (cigars)**, **monthly membership**, **21+ handling**, and **events + ticket sales** — without implementation detail here; this file is the **living checklist** to revisit and update.

**Related docs:** [`./IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) (phased roadmap), [`../LAUNCH_CHECKLIST.md`](../LAUNCH_CHECKLIST.md) (pre-launch owner review), [`./PHASE_0_SCOPE.md`](./PHASE_0_SCOPE.md) (**work Phase 0 here** — align deal & scope before discovery), [`../docs/CLIENT_PRICING_AND_TIMELINE.md`](../docs/CLIENT_PRICING_AND_TIMELINE.md) (included / not included + packages + timeline for client conversations).

**Last updated:** 2026-03-21

---

## How to use this doc

- [ ] Check off sections as you complete them.
- [ ] Add notes, dates, and owner under each phase when you align.
- [ ] When scope changes, edit here first, then mirror into GitHub issues / `IMPLEMENTATION_PLAN.md` if needed.

---

## Phase 0 — Align & protect the deal (before any build)

**Working document:** `PHASE_0_SCOPE.md` — fill tables, decisions log, and sign-off there.

- [ ] **One-page scope** with the business owner: what’s in v1, what’s later, what’s explicitly **out of scope**.
- [ ] **Money & timeline**: phased payments + optional monthly retainer (hosting, fixes, small content changes).
- [ ] **Risks in writing**: tobacco / e‑commerce rules, age verification expectations, refunds, chargebacks.
- [ ] **Roles**: who builds (you), who supports content/UX (partner), who approves and supplies truth (owner).

---

## Phase 1 — Discovery (what we’re actually building)

- [ ] **Admin — cigars:** required fields (name, price, stock, photos, active/inactive, descriptions, etc.).
- [ ] **Marketplace:** pickup-only vs shipping; where you ship; taxes; fulfillment (who packs / hands off).
- [ ] **Membership:** tiers, perks, monthly billing, cancellation rules; ties to logged-in customer.
- [ ] **21+:** minimum acceptable verification for launch (e.g. attestation + DOB vs stricter ID service) — document **v1** vs **later**.
- [ ] **Events + tickets:** capacity, refunds, transfers, check-in at door (list, QR, etc.).
- [ ] **Payments:** provider (e.g. Stripe); who creates account; payouts; fee responsibility.

---

## Phase 2 — Legal & operations (can run parallel to design)

- [ ] Owner confirms: returns, event cancellation, membership cancellation, age policy language.
- [ ] Optional: brief consult with counsel familiar with tobacco / online sales in your jurisdiction.
- [ ] **Privacy + terms** outline: what data you collect (email, payments, analytics).

---

## Phase 3 — Product design (no code yet)

- [ ] **User flows:** browse → cart → checkout → confirmation; events → ticket purchase; join membership.
- [ ] **Admin flows:** add/edit cigar, create event, view orders/tickets (v1 can be simple).
- [ ] **Wireframes / Figma** for shop, product, cart, checkout, account, admin, event pages.
- [ ] **Content:** product photos, event copy, membership FAQ — owner supplies or approves.

---

## Phase 4 — Technical plan (architecture only)

- [ ] **Backend + DB** where catalog, orders, events, and members live (aligns with future backend phase in `IMPLEMENTATION_PLAN.md`).
- [ ] **Auth:** customers vs admin roles.
- [ ] **Payments:** products for cigars, tickets, subscriptions; how “paid” state is confirmed (webhooks).
- [ ] **21+:** **tickets** = checkout policy/attestation as agreed; **cigar holds** = **in-store ID** at pickup (web does not replace counter check).
- [ ] **Hosting:** frontend + API/serverless pattern documented once.

---

## Phase 5 — Build in slices (reduce risk)

Suggested order (**aligned with `CLIENT_PRICING_AND_TIMELINE.md`**):

1. [ ] **Slice A — Foundation:** auth, database, Stripe **test**, deploy pipeline.
2. [ ] **Slice B — Events + paid tickets:** admin events + customer ticket checkout (Option A).
3. [ ] **Slice C — Cigar catalog + hold flow:** request form → staff **on hold** → pickup; **pay + ID in store** (Option B — no online cigar charge in v1 unless added).
4. [ ] **Slice D — Membership billing** (Option C — Stripe subscriptions).

---

## Phase 6 — Test & launch

- [ ] Staging: owner walks through flows on phone + desktop.
- [ ] Test payments (e.g. Stripe test mode); rehearse refunds.
- [ ] Soft launch: limited inventory/events; watch errors and support load.
- [ ] Go live: live keys, domain, owner announcement.

---

## Phase 7 — After launch

- [ ] **Training:** short session with owner on admin (cigars, events).
- [ ] **Runbook:** failed payment, refund request, sold-out event, membership cancel.
- [ ] **Cadence:** monthly or quarterly check-in if retainer includes it.

---

## Notes & iterations

_Use this section for freeform updates (meeting dates, decisions, links to proposals, etc.)._

-

---

## Quick reference — Owner wish list → roadmap *(priority updated)*

| Wish | Typical placement |
|------|-------------------|
| Events + buy tickets (paid online) | **Option A — build first** |
| Admin + cigar catalog + **hold / reserve** → pickup, **pay + ID in store** | **Option B — second** *(not full online cigar checkout in v1)* |
| Monthly membership | **Option C — third** |
| 21+ | **Tickets:** checkout attestation as agreed; **cigars:** **in-store ID** at pickup |
