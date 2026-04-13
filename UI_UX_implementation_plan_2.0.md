# UI/UX Implementation Plan 2.0

**Document status:** **Complete** (product spec + milestone tracking).  
**Last updated:** 2026-04-11  
**Companion:** [`UI_UX_implementation_plan.md`](./UI_UX_implementation_plan.md)  
**Audience:** Product + engineering.

---

## Implementation status (summary)

| Milestone | Scope | Code / docs |
|-----------|--------|-------------|
| **A — Shipped** | Legal alignment, no magic-link login UI, paid-only ticket lists (hide `pending_payment` in UI), admin **Ticket sales** labeling, Stripe cancel toast copy, **`UI_UX_implementation_plan.md`** aligned with no magic-link tab | **Done** in repo (see §7). |
| **B — Next build** | Events flow without early `/login`, auth modal at Pay/Reserve, `/thank-you` page, remove customer **cancel** everywhere, customer copy **bookings → tickets**, optional dashboard **View events** hub | **Specified** below; implement in a follow-up PR. |

---

## Locked product decisions (stakeholder — apply to build + copy)

| Topic | Decision |
|--------|----------|
| **Self-service cancel** | **Removed everywhere for customers** — Dashboard, Profile, **`/account`**, and any ticket list. No delete/cancel for end users. *(Milestone B: remove UI still present in components.)* |
| **Refunds** | **All ticket sales are final and non-refundable.** No self-serve refunds. Replace any refund-oriented CTAs with this policy + **Terms** + optional **contact / phone for questions only** (not for promised changes or refunds). |
| **Auth before pay (Events)** | **Modal** at commit time: **email + password** + **optional OAuth** (Google / Apple). **Full sign up** (e.g. name + email + password, match current signup rules) **inside the same modal** or a clear modal step—optimize for mobile later if needed. No full-page login for this flow. After success, modal closes and user continues to pay (or **Reserve** for free events). |
| **Magic link / OTP** | **Not in product.** Remove any **magic-link** or **`signInWithOtp`** UI from the app; no demo tab on Login. (Email **confirmation** links from Supabase sign-up are unchanged — that is not “magic link login.”) |
| **Thank-you page** | After purchase: dedicated **thank you** page, then primary CTA **View my tickets** → **`/dashboard`**. Secondary: browse events, directions as needed. |
| **Free vs paid events** | **Same journey:** event details → ticket count → guest info → **confirmation step** (same idea as the pre-Stripe review step). Final button label: **`Reserve`** (free) vs pay / Stripe (paid). If **not logged in**, the **login/signup modal** appears **on that final action** (not at card open). |
| **Admin wording** | Rename customer-facing admin labels from **Bookings** to **Ticket sales** (and related copy). DB table may remain `bookings`. |
| **Thank-you policy copy** | Must include, prominently: **“All ticket sales are final and non-refundable.”** Optional second line: **“Questions?”** + lounge phone / **Contact** (does **not** imply reschedules or refunds). |
| **Incomplete checkouts (`pending_payment`, etc.)** | Rows may remain in **Supabase** for future analytics/improvements. **For now:** do **not** surface half-started / abandoned checkouts in **customer** UI or **admin** UI (no lists, badges, or “complete payment” prompts for that state). Revisit when you intentionally build recovery or reporting. |

---

## 1. Desired goal (one paragraph)

A **new visitor** opens **Events**, picks an event, sees **details**, chooses **ticket count**, enters **contact info**, and reaches a **confirmation** step **without** being sent to the login page first. **Log in or sign up** appears only in a **small modal** at the final **Reserve** / **Pay** action, using **email + password** and **optional OAuth**. After auth, the modal **closes** and the user **finishes** (free **Reserve** or paid **Stripe**). After a successful purchase, they see a **thank-you** page, then **View my tickets** takes them to the **dashboard**. Customer copy uses **tickets** / **ticket purchase**, not **bookings**; **admin** uses **ticket sales**. **No self-service cancel** anywhere for users. **All ticket sales are final and non-refundable**; state that clearly on thank-you and in Terms; optional **phone / contact** for **questions only**.

---

## 2. Problems observed (current vs intent)

| Area | Current (pain) | Target |
|------|------------------|--------|
| **Events → Reserve** | `openReservation` sends guests to **`/login`** when `!user`. | Open dialog for everyone; auth **modal** only at **Reserve** / **Pay**. |
| **Post-pay** | Lands on Dashboard + query/toast. | **`/thank-you`** first; **View my tickets** → Dashboard. |
| **Copy** | “Bookings” everywhere. | **Tickets** (customers); **Ticket sales** (admin). |
| **Cancel** | Users can delete from dashboard (and elsewhere). | **Removed for all customer surfaces.** |
| **Refunds** | Mixed / implied. | **Final and non-refundable**; contact only for **questions**, not promised exceptions. |

---

## 3. User journeys (dummy language)

### 3.1 Guest — paid ticket

1. Go to **Events**, click an event → **popup opens** (no login yet).  
2. Pick **how many tickets**, fill **name / email / phone**.  
3. See a **confirmation** screen (“here’s what you’re buying”).  
4. Tap **Pay** (or whatever the paid button is) → **popup**: log in or sign up (**email + password** and/or **Google / Apple**).  
5. After login, **that popup goes away** → same flow → **Stripe**.  
6. After money works → **Thank you** page → **View my tickets** → **Dashboard**.  
7. Thank-you page states **all ticket sales are final and non-refundable**; optional **Questions?** + phone/contact (see §5).

### 3.2 Guest — free event

Same steps 1–3. Step 4 button says **Reserve** instead of Pay. Still **no account** until they confirm → then **same auth modal** → then **Reserve** runs (saves ticket). Then **thank you** → **View my tickets** → **Dashboard** (align success routing with paid where it makes sense).

### 3.3 Logged-in user

No auth modal at step 4; straight to Pay or **Reserve**.

### 3.4 After they started checkout but didn’t finish (pending)

**Data:** Incomplete flows can still be stored in Supabase (e.g. **`pending_payment`**) for **later** product/analytics work. **UI (for now):** Customers and admins are **not** shown these half-started states—no dashboard nags, no admin “abandoned cart” views—until you choose to expose them.

---

## 4. Events popup — auth modal (spec)

- **Log in:** Email, password, **Log in**; **Continue with Google** / **Apple** optional.  
- **Sign up (full, in popup):** Same fields as standalone signup where practical—e.g. **full name**, **email**, **password** (and confirm if you use it), same validation/password rules as **`Signup.tsx`**. Toggle or tabs inside modal: **Log in** | **Create account**.  
- **No** magic link, **no** `signInWithOtp` in UI.  
- **Dismissible** (X): return to confirmation step; don’t wipe their ticket form if possible.  
- **Mobile:** prefer **full-screen sheet** for this modal; stakeholder will flag if cramped after first build.

---

## 5. Thank-you page (`/thank-you`)

- **SEO:** `noIndex`.  
- **Headline:** Thank you for your ticket purchase (or match brand voice).  
- **Required policy line (prominent):** **“All ticket sales are final and non-refundable.”**  
- **Body:** Receipt by email, what to bring, link to **Terms**.  
- **Primary button:** **View my tickets** → **`/dashboard`**.  
- **Secondary:** Browse events, **Directions**.  
- **Optional:** **“Questions?”** + lounge phone or **Contact** link — wording must **not** imply refunds or reschedules.

---

## 6. Dashboard & lists (customer)

- **Remove** cancel/delete from **Dashboard**, **Profile**, **`/account/...`**.  
- **Replace** “refund” shortcuts with **final / non-refundable** + **Terms** + optional **Questions?** contact.  
- **Primary path:** **View events** (and/or sub-menu: directions, add more tickets → `/events`, link to **Terms**).  
- Rename visible **bookings** → **tickets** per mapping below.

### 6.1 Copy mapping (customer)

| Old | New |
|-----|-----|
| My bookings | My tickets |
| Bookings (stat) | Tickets |
| Upcoming bookings | Upcoming tickets / events |
| Cancel | *(removed)* |
| Refund | **All sales final** — see Terms; contact for **questions only** |

### 6.2 Admin

- Nav / titles: **Ticket sales** (not “Bookings”).  
- Internal code may still use `bookings` table.

---

## 7. Implementation phases (engineering)

### Milestone A — **Complete** (shipped in repo)

- [x] **E0** — Remove **magic link** tab from **`Login.tsx`**; **`PostAuthEmailConfirmRedirect`** comment cleanup.  
- [x] **E0b** — **`UI_UX_implementation_plan.md`** — Login section reflects **no** magic-link UI.  
- [x] **E5 / admin labels** — Sidebar **Ticket sales**, **`AdminBookings`**, **`AdminOverview`** copy and **Paid ticket sales** stat.  
- [x] **E5b** — **`useUserBookings`** / **`useAdminBookingsList`** / **`useAdminOverviewData`**: **paid-only** lists; hide incomplete checkouts in UI.  
- [x] **E6 Terms** — **§10 Event tickets purchased through this website**; **Events** link → **Event ticket terms**; Stripe cancel toast aligned (no “complete payment from Dashboard”).  
- [x] **E6 Privacy** — Reviewed: no ticket/refund copy requiring change (N/A).

### Milestone B — **Next PR** (spec locked; not yet shipped)

- [ ] **E1** — **`openReservation`**: guests open dialog without **`/login`** redirect; `?reserve=` works for guests.  
- [ ] **E2** — **`AuthRequiredDialog`**: login + full signup in modal + OAuth; wire to final **Pay** / **Reserve** only.  
- [ ] **E3** — **`/thank-you`** route + redirects from Stripe / free success; policy line + **View my tickets** → **`/dashboard`**.  
- [ ] **E4** — Remove **cancel** / delete flows from **Dashboard**, **Profile**, **`AccountBookingsPage`**; **View events** hub + policy messaging.  
- [ ] **E4b** — Customer copy sweep **bookings → tickets** (grep `src/pages`, customer components).  
- [ ] **E7** — Manual QA matrix for Milestone B.

---

## 8. Success criteria

### Milestone A (complete)

- [x] **Terms** + Events link reflect **all sales final / non-refundable** for web ticket purchases.  
- [x] No magic-link / OTP **login** UI in codebase.  
- [x] Customer + admin lists show **paid** ticket rows only; incomplete checkouts **hidden** from UI.  
- [x] Admin surfaces use **Ticket sales** naming (routes may stay `/admin/bookings` until a rename pass).

### Milestone B (definition of done for remaining 2.0 UX)

- [ ] No customer **cancel/delete** ticket action anywhere.  
- [ ] Guest completes event flow through **confirmation** without `/login` until final **Reserve**/**Pay**.  
- [ ] Auth modal = **email + password** + **full sign-up in popup** + **optional OAuth** (no magic link).  
- [ ] **Thank-you** page shows required policy line + **View my tickets** → **dashboard**.  
- [ ] Free events follow the **same step shape** as paid with **Reserve** as final free CTA.  
- [ ] Customer UI uses **tickets** not **bookings** (grep clean-up).

---

## 9. Stakeholder note — “What if they abandon Stripe?”

Sometimes someone taps **Pay**, gets sent to **Stripe**, then **closes the window** or hits **Back** **before** paying. The backend may still store a row (e.g. **`pending_payment`**) for future use.

**Locked decision:** **Neither customers nor admins need in-app visibility** into these half-started payments **for now**; keep the data in Supabase, build reporting/recovery UX later if desired. **Engineering note:** queries that power **dashboard / ticket sales lists** **filter to `paid`** so abandoned checkouts do not appear—reduces confusion if the user tries again.

---

## 10. Future (not in 2.0 scope unless reopened)

- Stripe **Customer Portal** (only if policy ever allows refunds—contradicts current **all sales final** stance).  
- Guest checkout without accounts (major RLS/product change).

---

## Appendix A — GitHub issue (create, then close when Milestone B ships)

**Title:** `UI/UX 2.0 — Milestone B: Events auth modal, thank-you page, cancel removal, copy sweep`

**Body (copy-paste):**

```markdown
Tracks **Milestone B** from [`UI_UX_implementation_plan_2.0.md`](./UI_UX_implementation_plan_2.0.md).

**Milestone A (done):** Terms §10, no magic-link login UI, paid-only lists (hide pending in UI), admin “Ticket sales” labels, Stripe cancel toast.

**Milestone B (this issue):**
- [ ] E1 — Events: open reservation dialog for guests; no early `/login`
- [ ] E2 — `AuthRequiredDialog` at Pay/Reserve (login + full signup + OAuth)
- [ ] E3 — `/thank-you` + redirects; policy line + View my tickets → dashboard
- [ ] E4 — Remove cancel/delete from Dashboard, Profile, AccountBookingsPage; View events hub
- [ ] E4b — Customer copy: bookings → tickets
- [ ] E7 — QA

**Close this issue** when all Milestone B checkboxes are done and merged to main (or your release branch).
```

**Repo automation note:** `gh` CLI was unavailable in the dev environment used to edit this repo. Create the issue in the GitHub UI from **Appendix A**, assign a number, and optionally add that number to your project board. **Closing** the issue: use GitHub **Close issue** after Milestone B merges, or add `Closes #<N>` to the **Milestone B** PR description.

---

*Decisions in § “Locked product decisions” supersede earlier open questions in prior drafts.*
