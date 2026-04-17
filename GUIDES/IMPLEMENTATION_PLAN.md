# Implementation Plan — Cigar Society Website

**Business**: Cigar Society, LLC  
**Address**: 116 W State Ave, Pharr, TX 78577  
**Phone**: (956) 223-1303  
**Stack**: React 18 · Vite · TypeScript · Tailwind CSS · shadcn/ui · Supabase (Phase 2 active) · payments (Phase 2)  
**Collaborators**: Ethan (Cursor) · Partner (Antigravity)  
**Repo**: `cigar-society-genesis`

---

## Workflow Rules

- Every task has a GitHub Issue before any code is written
- Preferred branch naming: `feat/issue-ID-short-description`
- If working on fixed branch `March-19,-2026`, do not create new branches
- Commit format: `[#ID] message`
- PR/merge to `main` is handled manually by you
- Reference `GITHUB_ISSUES_GUIDE.md` for full protocol

---

## Phase 1 — Foundation & Content Polish (COMPLETED)
*Goal: Replace placeholder content with real business data and align the design to the Cigar Society brand (brown/gold).*

| # | Issue | Label | Priority |
|---|---|---|---|
| 1 | Set up GitHub labels, milestones, and Cursor rules | `documentation` | 🔴 Urgent |
| 2 | Update real business content (name, phone, hours, address) | `content` | 🔴 Urgent |
| 3 | Replace placeholder images with real brand assets | `content` | 🔴 Urgent |
| 4 | Fix Google Maps embed with correct coordinates | `bug` | 🔴 Urgent |
| 5 | Align color palette with brand logo (brown/gold warmth) | `design` | 🟠 High |
| 6 | Polish Home / Landing page — all sections | `design` | 🟠 High |
| 7 | Polish Navbar — logo, links, mobile menu | `design` | 🟠 High |
| 8 | Build out About page with real story and ownership | `content` | 🟡 Medium |
| 9 | Build out Cigars catalog page | `content` | 🟡 Medium |
| 10 | Build out Membership page — removed (not needed) | `enhancement` | 🟡 Medium (Cancelled) |
| 11 | Build out Events page | `content` | 🟡 Medium |
| 12 | Build out Gallery page with real photos | `content` | 🟡 Medium |
| 13 | Build out Contact page with hours and map | `content` | 🟡 Medium |

**Phase 1 Definition of Done**: The site is fully populated with real content, looks on-brand, and is presentable to the business owner.

**Phase 1 Progress (completed):** Issues `#1–#13` are complete (workflow setup, business identity/contact updates, map embed, gold palette alignment, landing page polish, navbar improvements, gallery lightbox, About/Cigars/Events/Contact content updates, and image asset verification). Membership page is not in launch scope (see Issue 10).

### Phase 1.5 — Post-Polish Enhancements (COMPLETED)

* Video hero homepage (`Index` at `/`)
* Homepage promotion
* Hero CTA directions
* Map accuracy fix
* Metadata refresh
* Favicon update

### Phase 1.6 — Hero, About, navbar, and gallery (tracked)

Follow-up polish tracked as discrete GitHub issues. Full acceptance criteria and definition of done live on each issue.

| GitHub # | Issue | Label | Priority |
|---|---|---|---|
| [44](https://github.com/maximus34530/cigar-society-genesis/issues/44) | [Design] Simplify hero section — minimal layout | `design` | 🟠 High |
| [45](https://github.com/maximus34530/cigar-society-genesis/issues/45) | [Content] Build About page with real owner info and founding story | `content` | 🟠 High |
| [46](https://github.com/maximus34530/cigar-society-genesis/issues/46) | [Design] Hide Cigars and Contact pages from navbar | `design` | 🟠 High |
| [47](https://github.com/maximus34530/cigar-society-genesis/issues/47) | [Design] Convert Gallery page to carousel layout | `design` | 🟡 Medium |

**#44 — Hero** — Headline, single subtext (“South Texas' Finest Cigar Lounge.”), one centered “Visit the Lounge” CTA linking to Google Maps directions for 116 W State Ave, Pharr TX 78577; remove the second button; no extra paragraph blocks in the hero.

**#45 — About** — Real owner names (Rick and Brandon Romo), founding story, CCST credentials, real Google reviews on-page, and `{OWNER_QUOTE}` left visible for a later fill-in.

**#46 — Navbar** — Remove Cigars and Contact from the nav only; keep `Cigars` and `Contact` page files and routes intact.

**#47 — Gallery** — Replace the grid with a horizontal carousel using existing images; preserve dark background and gold accents; smooth swipe on mobile.

---

## Phase 2 — Supabase, dashboards, events & payments (ACTIVE)
*Goal: Add authenticated user and admin experiences, database-backed events, and payment processing. Detailed execution order and epics: **`Phase_2_implementation_plan.md`**.*

**Current team priority (high level)**

1. User dashboard (frontend first, then wire to Supabase)
2. Admin panel with CRUD (events first; then wire to Supabase)
3. Public Events page (real data from Supabase)
4. Supabase schema, Auth, and RLS aligned with the above
5. Payment processor integration (after core auth/data)

**On hold / “coming soon” unless reopened**: full membership system, contact form persistence, gallery CMS — see `Phase_2_implementation_plan.md`.

| # | Issue | Label | Notes |
|---|---|---|---|
| 14 | Supabase schema design — contact and events | `backend` | Evolve into focused schema issues (events, bookings, roles); contact on hold |
| 15 | Contact form → saves submissions to Supabase | `backend` | **On hold** per Phase 2 plan |
| 16 | Membership waitlist / signup → saves to Supabase | `backend` | **On hold** |
| 17 | Events table — dynamic events on Events page | `backend` | **High priority** |
| 18 | Gallery table — dynamic photo gallery management | `backend` | **On hold** |
| 19 | Admin dashboard scaffold (manage events, gallery, inquiries) | `enhancement` | **High priority** — events CRUD first |

**Phase 2 Definition of Done (rolling)**: User dashboard, admin CRUD for events, and public Events page backed by Supabase with appropriate RLS; payments integrated per product scope; workflow in `GITHUB_ISSUES_GUIDE.md` (issues + approved commits; never agent commits to `main`).

---

## Phase 3 — Launch Prep
*Goal: Harden the site for public launch.*

**Status (codebase):** Implementation complete except **Issue 25** (owner sign-off — use `LAUNCH_CHECKLIST.md`) and **live deploy** (connect repo in Vercel — Issue 20 operational step).

**Execution order**

1. Configure Vercel deployment with env vars (Issue 20)
2. Mobile responsiveness QA pass (Issue 24)
3. SEO — meta tags, Open Graph, sitemap (Issue 21)
4. Performance audit — image optimization, lazy loading (Issue 22)
5. Accessibility audit (a11y) (Issue 23)
6. Final content review with business owner (Issue 25)

Issue 26 (Analytics) is part of Phase 3 backlog; schedule after deploy/QA or in parallel once baseline traffic measurement is needed.

| # | Issue | Label | Priority |
|---|---|---|---|
| 20 | Configure Vercel deployment with env vars | `documentation` | 🔴 Urgent (phase start) |
| 24 | Mobile responsiveness QA pass | `bug` | 🟠 High |
| 21 | SEO — meta tags, Open Graph, sitemap | `enhancement` | 🟠 High |
| 22 | Performance audit — image optimization, lazy loading | `enhancement` | 🟡 Medium |
| 23 | Accessibility audit (a11y) | `enhancement` | 🟡 Medium |
| 25 | Final content review with business owner | `content` | 🟠 High |
| 26 | Analytics tracking setup | `enhancement` | 🟡 Medium |

**Phase 3 Definition of Done**: Site is live on a custom domain, fast, SEO-ready, and approved by the business owner.

## Non-Goals (Phase 1 / static launch — historical)

*Phase 1 shipped without:* authentication, payment processing, membership system, admin dashboard, or Supabase-backed features.

## Phase 2 scope (in progress)

Authentication, admin and user dashboards, Supabase-backed events (and related tables), and payment processing are **in scope** per `Phase_2_implementation_plan.md`. Membership, contact DB persistence, and gallery CMS remain **on hold** until re-prioritized.

**Delivered in repo**

| Issue | What was implemented |
|-------|------------------------|
| 20 | `vercel.json` SPA rewrites; `README.md` deploy + env instructions |
| 21 | Per-route `Seo` + `react-helmet-async`; `public/sitemap.xml`; `robots.txt` sitemap line; `public/og-preview.jpg` |
| 22 | Route-level code splitting (`lazy` + `Suspense`); lazy images where applicable |
| 23 | Skip link + `#main-content`; 404 uses `Layout`; gallery keyboard space handling |
| 24 | *(Manual QA)* — verify breakpoints on real devices after deploy |
| 25 | `LAUNCH_CHECKLIST.md` — owner completes |
| 26 | `AnalyticsScripts` + `trackEvent` for Plausible/GA env vars; CTA events on home + contact |

---

## Real Business Data (Reference)

```
Business Name:  Cigar Society, LLC
Address:        116 W State Ave, Pharr, TX 78577
Phone:          (956) 223-1303
Rating:         5.0 ★ (27 Google Reviews)
Hours:          Closes 11 PM (full hours TBD)
Branding:       Brown/gold; "La Sociedad" sub-brand (no membership system at launch)
Offerings:      Cigars, bourbon, beer, mixed drinks
Lounge:         Dark interior, TVs, lounge seating
```

### Real Google Reviews (use on site)
- *"Great vibe great choice of cigars great service will be coming back !!!"*
- *"Excellent selection of cigars burbon beer or mixed drinks."*
- *"Nice place and wonderful personable owners."*

---

## Tech Decisions

| Decision | Choice | Reason |
|---|---|---|
| Frontend | React + Vite + TS + Tailwind | Already scaffolded |
| UI Components | shadcn/ui | Already installed |
| Backend (Phase 1) | None — static site | Shipped |
| Backend (Phase 2) | Supabase + Auth + RLS | Active — see `Phase_2_implementation_plan.md` |
| Payments (Phase 2) | Provider TBD (e.g. Stripe) | After core auth/data |
| Deployment | Vercel | Best DX for Vite/React |
| State/Data | TanStack Query | Required for async server state in Phase 2; add `@tanstack/react-query` when wiring Supabase reads/writes |
| Forms | React Hook Form + Zod | Already in package.json |

---

## Folder Conventions

```
src/
  pages/          # One file per route
  components/     # Shared UI components
    ui/           # shadcn primitives (do not edit manually)
  hooks/          # Custom React hooks
  lib/            # Utilities, Supabase client, helpers
  assets/         # Static images and icons
```

---

## Getting Started (for both collaborators)

```bash
# Clone repo
git clone <repo-url>
cd cigar-society-genesis

# Install
npm install

# Dev server
npm run dev

# Before starting any work — create/find a GitHub Issue first
# Branch naming: feat/issue-ID-short-description
```

---

## Future Roadmap (Post-Launch Expansion)

Recent client requests include additional functionality beyond the current launch scope.  
These features are acknowledged and planned, but will be implemented **only after Phase 3 (Launch Prep) is complete and approved**.

**Operational checklist (discovery → launch slices):** see `ONBOARDING_PLAN.md` (living document; iterate there).

**Owner-aligned build order (post Phase 3):** documented in `docs/CLIENT_PRICING_AND_TIMELINE.md` and `PHASE_0_SCOPE.md`:

1. **Events + ticket payments** (Stripe)  
2. **Cigar catalog + hold / reserve** → customer picks up, **pays in store**, **ID in store** *(no full online cigar checkout in v1 unless rescoped)*  
3. **Monthly membership** (Stripe subscriptions)

The numbered **capability** sections below (4–6) describe *what* gets built; **when** follows the order above.

---

### Phase 4 — Commerce System (cigar side)

**Objective**: Support cigar sales in a **compliance-friendly** way: catalog + **hold/reserve** workflow before full online checkout (if ever).

**Scope**:
- Admin panel (add/edit/remove cigars, stock / hold status)
- Customer **request** flow → staff **places hold** → **in-store pickup**, **payment at lounge**, **21+ at counter**
- *(Optional later)* Marketplace with Stripe checkout for cigars — **not** assumed for v1 of this phase

**Notes**:
- Aligns with **Option B** in `CLIENT_PRICING_AND_TIMELINE.md`
- Admin UI can stay simple (table/forms)

---

### Phase 5 — Membership & Community

**Objective**: Introduce recurring revenue and customer retention.

**Scope**:
- Monthly membership (Stripe subscriptions)
- Member perks (discounts, exclusive access, etc.)

**Notes**:
- Requires authentication system
- **Typically third** in the owner-aligned order (after events + cigar holds)

---

### Phase 6 — Events & Ticketing

**Objective**: Monetize and manage in-person events.

**Scope**:
- Event listings (dynamic)
- Ticket purchasing system (Stripe)

**Notes**:
- **Typically first** in the owner-aligned revenue build
- Refund / capacity rules owned by the business

---

## Constraints

- These phases are **NOT included in the current build scope**
- Current scope remains:
  → Static site + content + polish + deployment
- No backend, payments, or auth will be implemented until Phase 4 begins

---

## Strategic Approach

- Phase 1–3: Launch fast, build trust, establish presence
- Phase 4+: Introduce revenue systems incrementally
- Avoid building all systems at once to reduce risk and complexity

