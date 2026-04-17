# Phase 2 — Implementation Plan (Active)

**Project**: Cigar Society Genesis (`cigar-society-genesis`)  
**Business**: Cigar Society, LLC — Pharr, TX  
**Status**: **Phase 2 is active** (no longer back burner).  
**Companion docs**: `GITHUB_ISSUES_GUIDE.md`, `IMPLEMENTATION_PLAN.md`, `GITHUB_ISSUES_BACKLOG.md`

---

## 1. Goals (what “done” looks like for this phase)

By the end of Phase 2 (as currently scoped by the team):

1. **User dashboard (customer-facing)** — Signed-in users have a dedicated area for account-related actions (profile, bookings or registrations, and future membership hooks). UI is built first; real data and auth wire up when Supabase is integrated.
2. **Admin dashboard** — Staff can **create, read, update, and delete** the things you manage day-to-day (at minimum **events**; extend to other entities as you define them). Starts as UI + flows; connects to Supabase with proper **auth + RLS**.
3. **Events (public)** — The public **Events** page lists real events from the database (not “coming soon” placeholders), with loading/empty/error states.
4. **Supabase backend** — Schema, **Row Level Security (RLS)**, and API usage align with who can see and change what (public vs logged-in user vs admin).
5. **Payments** — Payment processing is integrated for the flows you choose (e.g. event tickets, deposits, or memberships—**product decision required**). Typically implemented **after** auth and core data exist so you can attach payments to real rows (bookings, orders, etc.).

**Explicitly on hold (“coming soon” in UI only)** — no full build until Phase 2 later tranche or a separate milestone:

- **Membership** (full signup/benefits system)
- **Contact form** → database persistence (keep current “call us” / simulated behavior, or a single “coming soon” banner—your choice per issue)
- **Gallery** → CMS-style database + admin (static gallery remains)

---

## 2. Guiding principles

- **One GitHub Issue per deliverable** (or per thin vertical slice). No orphan work.
- **Frontend-first for dashboards** lets designers and stakeholders review layout and flows before schema is frozen.
- **Backend second** avoids rewriting tables because the UI changed.
- **Payments last** reduces risk: fewer moving parts while auth and RLS are still settling.
- **Never put service-role secrets in the browser**; admin operations either use **elevated Supabase roles via secure patterns** (e.g. serverless/Edge Functions) or **RLS** with `auth.uid()` and role claims—decide per feature with a short ADR note in the issue.

---

## 3. Recommended work order (epics)

### Epic A — User dashboard (frontend first)

**Purpose**: A logged-in customer experience shell (navigation, layout, empty states, and placeholder sections for “my bookings” / “my events” / “account”).

**Suggested steps**

1. **Information architecture** — List routes (e.g. `/account`, `/account/bookings`). Decide what appears in nav vs only when logged in.
2. **Layout** — Reuse `Layout` patterns; add an “account” sub-layout (sidebar or tabs on desktop, stacked on mobile).
3. **Screens (static / mock)** — Profile summary, list placeholders, “no data yet” states. Use shadcn/ui.
4. **Auth gates (UI only first)** — Route wrappers that *eventually* check session; initially can be feature-flag or mock “logged in” for dev only **behind a clear TODO/issue** so it never ships wide open.
5. **Forms** — Where users will edit profile or preferences, use **React Hook Form + Zod** (project standard) even if submit is stubbed until Epic D.

**Exit criteria (issue-level)**

- [ ] Routes and navigation are defined and responsive.
- [ ] All dashboard pages have intentional empty/loading patterns documented in the issue.
- [ ] No fake “success” that implies data was saved unless the issue explicitly covers backend.

---

### Epic B — Admin panel with CRUD (frontend first, then wire-up)

**Purpose**: Internal tools for staff to manage **events** (minimum) and any other entities you add (e.g. bookings read-only).

**Suggested steps**

1. **Admin route namespace** — e.g. `/admin`, `/admin/events`. **Protect routes** (same as user dashboard: start with guard TODO, then real auth in Epic D).
2. **Events CRUD UI** — List view (table or cards), create/edit form (title, description, start/end time, image URL or upload later, published flag), delete with confirmation.
3. **Optimistic UX** — Loading states, validation errors, toast feedback (patterns already in the app).
4. **API abstraction** — Even before Supabase, define functions like `listEvents`, `upsertEvent`, `deleteEvent` in `src/lib/` so swapping the implementation to Supabase is mechanical.

**Exit criteria (issue-level)**

- [ ] Full CRUD loop exists in the UI for events.
- [ ] Validation rules documented (required fields, datetime rules).
- [ ] Clear separation: “UI complete” issue vs “wired to Supabase” issue.

---

### Epic C — Public Events page (frontend + product polish)

**Purpose**: Replace “coming soon” blocks with a real listing driven by the same **event model** the admin edits.

**Suggested steps**

1. **Card design** — Align with brand; show date, title, short description, CTA (register / buy ticket / “details” — depends on payments scope).
2. **Ordering & filters** — e.g. upcoming first, hide past events, optional filter by category.
3. **Detail view (optional)** — `/events/:id` for shareable links and richer SEO (`Seo` per route).
4. **Data hook** — Start with mock data in the issue; switch to TanStack Query + Supabase in Epic D.

**Exit criteria**

- [ ] Events page reflects real data when backend is on (or mock with a single flag documented in the issue).
- [ ] Loading, empty, and error states match the rest of the site.

---

### Epic D — Supabase backend (schema, auth, RLS, wire dashboards + events)

**Purpose**: Single source of truth in Postgres; safe access from the browser and from any serverless helpers you add later.

**Suggested steps**

1. **Schema** — Align with existing tables where possible (`public.events`, `public.bookings`). Add columns/indices for admin workflow (e.g. `published`, `slug`, `starts_at`). Add **profiles** or **user_roles** if admins are not “everyone signed up.”
2. **Auth** — Supabase Auth (email magic link, OAuth, or email/password—**decide in an issue**). Map `auth.users` → `profiles`.
3. **RLS policies** — Examples to define in issues:
   - Public: `SELECT` on **published** events only.
   - User: `SELECT/INSERT/UPDATE` on own bookings (if applicable).
   - Admin: `ALL` on events (or scoped) via **role claim** or **admin table** checked in policies.
4. **Client usage** — Keep app client usage in `src/lib/supabase.ts`; use **TanStack Query** for queries/mutations (add dependency when this epic starts—see `package.json`).
5. **Wire Epic A–C** — Replace mocks with real calls; remove dev-only bypass flags.

**Exit criteria**

- [ ] Migrations applied through your agreed process (Supabase migration workflow / MCP—no ad-hoc raw SQL in random files).
- [ ] RLS enabled on sensitive tables; smoke-tested with anon vs user vs admin.
- [ ] `npm run test:supabase` (or successor) still passes; add integration tests if you adopt them.

---

### Epic E — Payment processing

**Purpose**: Charge customers for defined products (tickets, deposits, etc.) and record payment state in Supabase.

**Suggested steps**

1. **Provider choice** — Most teams use **Stripe** (Checkout or Payment Element). Document choice in an issue.
2. **What is sold** — Link payments to **event registration**, **booking hold**, or **membership deposit** (product decision).
3. **Server-side secrets** — Payment **secret** keys only on server (Vercel serverless, Supabase Edge Function, or Stripe webhook endpoint). Never in Vite `VITE_*`.
4. **Webhooks** — Update Supabase rows on `checkout.session.completed` / `payment_intent.succeeded` as appropriate.
5. **Admin visibility** — Admin panel shows payment status (read-only at minimum).

**Exit criteria**

- [ ] Test mode end-to-end works (card → webhook → row update).
- [ ] Production keys documented in Vercel env (not committed).

---

## 4. “Coming soon” / on-hold areas (keep organized)

| Area | What to do now |
|------|----------------|
| **Membership** | Single “Coming soon” section or badge; no new tables/workflows until an issue re-opens scope. |
| **Contact form** | Keep current behavior (toast + call-to-action) **or** add a short banner: “Online messaging coming soon.” Do **not** wire to DB until an issue says so. |
| **Gallery CMS** | Keep static gallery; optional small note in UI that “online gallery management is coming later.” |

Each on-hold area should have **one open GitHub issue** in backlog state if you want visibility, or **no issue** until you prioritize—team preference.

---

## 5. Suggested issue breakdown (examples)

Create issues as you go (agent default: **create automatically** unless you say otherwise). Example split:

- `[Feature] User dashboard — routes & shell (mock data)`
- `[Feature] Admin — events CRUD UI (mock API)`
- `[Feature] Public Events page — layout & listing (mock → real)`
- `[Backend] Supabase — events schema + RLS + public read`
- `[Backend] Supabase — auth + profiles + admin role`
- `[Backend] Wire admin events CRUD to Supabase`
- `[Backend] Wire user dashboard to bookings/events`
- `[Feature] Stripe — checkout for [product] + webhook + DB updates`

Smaller issues = easier review and safer deploys.

---

## 6. Dependencies & repo notes

- **`@tanstack/react-query`** is required by project rules for async data; add it when Epic D wiring begins (it is not required for pure UI epics if you use local state/mocks).
- **Existing Supabase tables** (`events`, `bookings`) may need column additions—track in schema issues.
- **Vercel env**: document new secrets (Stripe, Supabase service role for server only) in `README.md` or a dedicated ops issue—never commit values.

---

## 7. Definition of Done (Phase 2 — rolling)

When closing Phase 2–related issues, prefer:

- Production build passes; no new `console.log` in production paths.
- Mobile + desktop sanity check on touched routes.
- RLS/auth documented in the issue or linked doc for anything that touches data.
- User explicitly approved **commit + sync** to the working branch (see `GITHUB_ISSUES_GUIDE.md`).

---

## 8. Open decisions (capture in GitHub issues)

1. **User dashboard**: Is it for **any signed-up customer**, **members only**, or **booking holders only**?
2. **Admin**: Single shared admin login vs per-staff accounts?
3. **Payments**: What exactly is sold first (event ticket, table booking deposit, membership deposit)?
4. **Identity**: Email magic link vs password vs Google OAuth for customers and/or staff?

Once these are decided, adjust Epic A/E acceptance criteria in the corresponding issues.
