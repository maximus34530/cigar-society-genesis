# Cigar Society — Pricing & timeline (client draft)

**For:** You + owner (+ partner). **Not** a public promise until you publish it.  
**Updated:** 2026-03-21 · **Paired with:** [`PHASE_0_SCOPE.md`](../GUIDES/PHASE_0_SCOPE.md)

---

## At a glance

| # | Option | Plain English | $ on website? |
|---|--------|----------------|---------------|
| **A** | Events & tickets | Sell tickets online | **Yes** (Stripe) |
| **B** | Cigar holds | Customer requests → staff holds → **pay + ID at lounge** | **No** for cigar total in v1 |
| **C** | Membership | Monthly subscription | **Yes** (Stripe) |

**Build order:** **A → B → C** (one signed phase at a time).

---

## Why this order?

1. **Tickets** — fastest path to paid events + Stripe in place.  
2. **Holds** — avoids full online tobacco checkout at first; **ID at pickup**.  
3. **Membership** — easiest after payments + trust are working.

---

## Option A — Events & tickets *(build first)*

| | |
|---|-----|
| **Outcome** | Events on the site; **paid tickets** online; basic capacity & refund rules. |
| **$** | **$[TBD]** (after discovery) |
| **Time** | **~4–8 weeks** from kickoff *(rough)* |
| **21+ (tickets)** | Policy + checkout attestation — confirm wording with owner |

---

## Option B — Cigar hold / pickup *(build second)*

| | |
|---|-----|
| **Outcome** | Admin **cigar list** + customer **request form** → staff **on hold** → customer **picks up**, **pays in store**, **ID at counter**. |
| **$** | **$[TBD]** |
| **Time** | **~6–10 weeks** after B kickoff *(rough)* |
| **v1 note** | **No** charge for the cigar on the website unless you add a **deposit** later (separate scope). |

---

## Option C — Membership *(build third)*

| | |
|---|-----|
| **Outcome** | Monthly billing (Stripe), member account, perks you define. |
| **$** | **$[TBD]** |
| **Time** | **~4–8 weeks** from kickoff *(rough)* |

---

## Optional retainer

| | |
|---|-----|
| **$ / month** | **$[TBD]** |
| **Usually includes** | Small fixes, hosting help, **~[TBD] hrs** coordination |
| **Not included** | Big new features, ads, legal, POS integration |

---

## What’s usually included (each option)

| | A | B | C |
|---|---|---|---|
| Written scope + discovery for that phase | ✓ | ✓ | ✓ |
| Staging + production deploy | ✓ | ✓ | ✓ |
| Stripe (test → live) | ✓ tickets | — | ✓ subs |
| Simple admin (events / cigars & holds / membership) | ✓ | ✓ | ✓ |
| 30-day bug fix window (in-scope only) | ✓ | ✓ | ✓ |
| 1 training call (~1 hr) | ✓ | ✓ | ✓ |

---

## Usually *not* included

| Item | Why |
|------|-----|
| Lawyer / licenses / compliance | Owner + counsel |
| Taxes / bookkeeping | Owner + CPA |
| Pro photo / unlimited copy rounds | Extra quote |
| **Full cigar price charged on site** (B v1) | By design — pay in store |
| POS / in-store terminal integration | Separate project |
| Native mobile apps | Out of scope |

---

## Rough timeline (replace with real dates)

| Step | What happens |
|------|----------------|
| 0 | Phase 0 sign-off + deposit |
| 1–2 | Discovery — freeze **A** first |
| 3+ | Build & launch **A** |
| | Then **B** |
| | Then **C** |

Add **~15–25%** buffer for feedback and Stripe setup.

---

## Payment terms *(edit with owner)*

| | |
|---|-----|
| Deposit | **[TBD]%** when scope is signed |
| Staging | **[TBD]%** when owner approves staging |
| Launch | **[TBD]%** within **[TBD]** days of go-live |
| Retainer | Billed monthly on day **[TBD]** if used |

---

## Assumptions

- Owner sets **ticket refund** rules.  
- Owner sets **hold length** (e.g. 24–48h) and **no-show** rule for **B**.  
- **Stripe** account is the **business’s**.  
- One **main approver** on the owner side.

---

## Next steps

1. Owner reads this + [`PHASE_0_SCOPE.md`](../GUIDES/PHASE_0_SCOPE.md).  
2. Fill all **$[TBD]** and dates.  
3. Sign Phase 0 → start discovery for **Option A**.

---

## Public website “pricing” page later?

Keep **exact $** private until you’re sure. A future `/pricing` page can show **packages without numbers** or “starting at…” only.
