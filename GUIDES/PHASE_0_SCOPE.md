# Phase 0 — Align & protect the deal

**Status:** Draft — edit with the owner before any build starts.  
**Updated:** 2026-03-21  

---

## TL;DR

| | |
|---|-----|
| **What this doc is for** | Agree on **what we build**, **in what order**, **who pays for what**, and **who decides** — so nobody’s surprised later. |
| **Build order (1 → 2 → 3)** | **① Event tickets** (pay online) → **② Cigar holds** (request online, **pay + ID in the store**) → **③ Monthly membership** |
| **When coding starts** | After the checkboxes in **§8** are ready (or $/dates marked TBD with a plan). |

**Related files:** [`../docs/CLIENT_PRICING_AND_TIMELINE.md`](../docs/CLIENT_PRICING_AND_TIMELINE.md) (prices & packages) · [`./ONBOARDING_PLAN.md`](./ONBOARDING_PLAN.md) (full process)

---

## The three builds (simple version)

### ① Option A — Events & tickets *(first)*

1. Customer buys a ticket **on the website** and pays **online** (e.g. Stripe).  
2. Lounge manages events in **admin** (dates, price, how many tickets, etc.).

---

### ② Option B — Cigar holds *(second)*

1. Customer **fills out a form** (which cigar, how many, contact info).  
2. **Staff** puts that inventory **on hold** in **admin**.  
3. Customer **comes to the lounge**, **pays in person**, staff checks **ID** there.  

**Not in v1:** charging the full cigar price on the website or shipping cigars — unless you change scope later.

---

### ③ Option C — Membership *(third)*

- Members pay **monthly** online (e.g. Stripe subscription), with perks you define.

---

## Goals (one glance)

| Topic | Answer |
|-------|--------|
| **Why build this** | More revenue from **events**, smoother **cigar requests**, then **repeat income** from membership — with **less “call the dev for every change.”** |
| **Who it’s for** | **21+** customers; cigar part is **pickup at the lounge**, not e‑commerce shipping in v1. |
| **What we’re not doing in v1** | Phone app, full POS hookup, or “Amazon-style” cigar checkout online. |

---

## Scope summary

| Option | What | Money on the web? |
|--------|------|-------------------|
| **A** | Events + paid tickets | **Yes** — ticket payment online |
| **B** | Catalog + hold requests + staff workflow | **No** for the cigar itself in v1 — **pay at the lounge** |
| **C** | Monthly membership | **Yes** — subscription |

**Later / extra quotes:** online cigar payment, shipping, stricter online ID vendors, POS integration.

**Out unless we re-scope:** lawyer-level compliance work, owner’s taxes, unlimited marketing, 24/7 enterprise support.

---

## Money & dates *(fill in with owner)*

| Topic | Draft |
|-------|--------|
| **How we charge** | Fixed price **per option** (A, then B, then C) + optional **monthly retainer** |
| **Old quote reminder** | ~**$750** landing + ~**$250**/page was for the **marketing site** — **this platform is a separate scope** |
| **Payment split** | **[TBD]%** deposit · **[TBD]%** when staging looks good · **[TBD]%** at launch |
| **Who pays Stripe/hosting/domain** | Usually the **business (owner)** — see pricing doc for detail |

### Target dates *(optional)*

| Milestone | Date |
|-----------|------|
| Phase 0 agreed | |
| Discovery done | |
| Option A on staging | |
| Option B on staging | |
| Option C on staging | |
| Go-live | |

---

## Risks everyone should know

| Topic | Plain English |
|-------|----------------|
| **Cigars** | Website = **request + hold**. **Sale + ID** happen **in the store**. |
| **Tickets** | **21+** policy + checkout rules — agree what the site says and what Stripe needs. |
| **Refunds** | Owner sets rules for **tickets** (online) vs **holds** (store policy). |
| **Inventory** | If admin says “in stock,” that’s on the **team** to keep accurate. |
| **Speed** | One **main approver** on the owner side helps us hit dates. |

---

## Who does what

| Who | Job |
|-----|-----|
| **Build (Ethan)** *— edit name if needed* | Code, Stripe wiring, deploys, GitHub issues |
| **Partner** *[name TBD]* | Content, UX help, working with the owner |
| **Owner (Cigar Society)** *[name TBD]* | Prices, inventory, policies, yes/no on scope |
| **Owner’s business** | Owns Stripe account, contracts, insurance if any |

**Decisions:** Owner has final say on **business** stuff. **Scope changes** = talk first, then maybe a **change order**.

---

## “Homie deal” *(if you trade marketing / intros for $)*

Write down **what** and **how much** so it’s fair:

| You offer | From who | How we’ll know it’s done |
|-----------|----------|---------------------------|
| | | |
| | | |

---

## Decisions log

| Date | What we agreed |
|------|----------------|
| 2026-03-21 | First draft of Phase 0 + pricing doc (local) |
| 2026-03-21 | Build order: **A → B → C** (owner still to sign off) |
| | |

---

## Sign-off — Phase 0 complete?

Check when true:

- [ ] Owner understands **A → B → C** and what’s **not** in v1 for cigars (no web charge for cigar line in B v1).  
- [ ] Money: either **numbers agreed** or **TBD** with a **date** to decide.  
- [ ] Risks above **read and OK’d**.  
- [ ] Roles **clear**.

**OK to start Phase 1 (Discovery)?** ☐ Yes — date: ___________

**Meeting notes:**

---

*When this is done, tick Phase 0 in `ONBOARDING_PLAN.md` and move on to discovery.*
