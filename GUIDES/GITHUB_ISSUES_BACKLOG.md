# GitHub Issues Backlog — Cigar Society Website

**Repo**: `cigar-society-genesis`  
**Business**: `Cigar Society, LLC` (Pharr, TX)  
**Source**: `IMPLEMENTATION_PLAN.md` + `Phase_2_implementation_plan.md` + `docs/CLIENT_PRICING_AND_TIMELINE.md` / `ONBOARDING_PLAN.md` where scope overlaps.

### Phase naming (avoid confusion)

| Doc | What “Phase 2” means |
|-----|----------------------|
| **`IMPLEMENTATION_PLAN.md`** (table #14–#19) | Historically framed as **Supabase-only** backlog items |
| **This backlog + `Phase_2_implementation_plan.md` (current)** | **Active engineering phase**: dashboards, events, payments, Supabase/auth as sequenced there — **not** identical to the short “Supabase back burner” line in older plan text |
| **Client digital proposal (PDF)** | **Communication & events** commercial package (Stripe, booking, etc.) — map dates/$ to `docs/CLIENT_PRICING_AND_TIMELINE.md` |

When in doubt, **GitHub issue titles + `Phase_2_implementation_plan.md`** are the source of truth for *current* Phase 2 work.

## Label Conventions

Use the standard labels from `GITHUB_ISSUES_GUIDE.md`:
- `enhancement`
- `bug`
- `documentation`
- `refactor`
- `urgent`
- `content`
- `design`
- `backend`

Notes:
- Where the plan used `chore`, map it to `documentation` (deployment/config/ops work).
- Phase 2 issues use `backend` / `enhancement` as appropriate; **track new work with new GitHub issues** (see `Phase_2_implementation_plan.md`).

## Phase 1 — Foundation & Content Polish (COMPLETED)

Issues: 1–13  
Status: ✅ Complete

---

## Phase 1.5 — Post-Polish Enhancements (COMPLETED)

Issues:

* Video hero homepage (`Index` at `/`)
* Homepage promotion
* Hero CTA directions
* Map accuracy fix
* Metadata refresh
* Favicon update

Status: ✅ Complete

---

## Phase 1.6 — Hero, About, navbar, gallery (GitHub #44–#47)

Discrete polish issues; detailed acceptance criteria live on GitHub. **Codebase:** carousel gallery, navbar visibility, About/hero iterations — treat issues as **done in code** unless still open for owner sign-off only.

| # | Summary | Typical labels |
|---|---------|----------------|
| [44](https://github.com/maximus34530/cigar-society-genesis/issues/44) | Simplify hero — minimal layout, focused CTA | `design` |
| [45](https://github.com/maximus34530/cigar-society-genesis/issues/45) | About — owners, story, CCST, reviews | `content` |
| [46](https://github.com/maximus34530/cigar-society-genesis/issues/46) | Hide Cigars + Contact from navbar (routes stay) | `design` |
| [47](https://github.com/maximus34530/cigar-society-genesis/issues/47) | Gallery — horizontal carousels by category | `design` |

**Gallery implementation notes (#47 / `CategorizedGallerySection`):** duplicated track + `requestAnimationFrame` auto-scroll; **odd rows** scroll content **right → left**, **even rows** **left → right**; reverse rows seed `scrollLeft` in `useLayoutEffect` + `ResizeObserver` with **programmatic scroll flag** so `onScroll` does not trigger a multi-second pause; edge gradient masks; `prefers-reduced-motion` → static grid; tile opens lightbox `Dialog`.

---

## Phase 2 — Supabase, dashboards, events & payments (ACTIVE)

**Status**: In progress. Detailed sequence: `Phase_2_implementation_plan.md`.

**Legacy milestone issues (original backlog)**: 14–19 — still valid as *reference*; **priorities have shifted** (admin + user dashboards, events, payments first; contact / membership / gallery DB work on hold unless reopened).

**Workflow**: See `GITHUB_ISSUES_GUIDE.md` — create issues per task, **no commit/push without user approval**, never commit to `main` from agent work.

## Phase 3 — Launch Prep

Issues: 20–26

**Codebase status (high level):** Most Phase 3 *implementation* items exist in the repo (SEO, analytics hooks, a11y baselines, code-splitting). What usually remains is **operational** (Vercel project linked to repo, env in dashboard) and **owner sign-off** (#25). See per-issue **Current status (repo)** below.

--- 

## Issues (1–26) + see **Additional issues (#44–#47, #81)** at end of file

### Issue 1 — [Docs] Set up GitHub labels, milestones, and Cursor rules
**Milestone**: Phase 1: Foundation & Content Polish  
**Labels**: `documentation`, `urgent`  
**Objective**: Ensure the project workflow is consistent and professional before major UI/content edits.
**Acceptance Criteria**
- [ ] GitHub labels exist and match the names in `GITHUB_ISSUES_GUIDE.md`
- [ ] Milestones exist for Phase 1 / Phase 2 (Active) / Phase 3
- [ ] Cursor rules file(s) are in place and reflect the repo workflow expectations
- [ ] A default issue template/workflow is clearly documented (link to `GITHUB_ISSUES_GUIDE.md`)
**Technical Notes**
- **GitHub MCP:** Docker running; image `ghcr.io/github/github-mcp-server`. Put **`GITHUB_PERSONAL_ACCESS_TOKEN` in repo-root `.env.local`** (gitignored). Local `.cursor/mcp.json` should load secrets via **`docker … --env-file .env.local`** — do **not** paste the token into committed JSON. See `cursor-agent-bundle/MCP_SETUP.md`. Restart Cursor after MCP config changes.
- Issue operations via MCP should use labels/milestones consistent with this guide.

### Issue 2 — [Content] Update real business content (name, phone, hours, address)
**Milestone**: Phase 1: Foundation & Content Polish  
**Labels**: `content`, `urgent`  
**Objective**: Replace placeholder data with real Cigar Society information.
**Acceptance Criteria**
- [ ] `About`, `Home`, `Contact`, and any footer/header blocks show the correct business name/address/phone
- [ ] Hours are present in a single source of truth (and reused consistently across pages)
- [ ] No placeholder contact text remains on any route
**Technical Notes**
- Treat phone/address/hours as business constants in a shared place (avoid duplicating strings).

### Issue 3 — [Content] Replace placeholder images with real brand assets
**Milestone**: Phase 1: Foundation & Content Polish  
**Labels**: `content`, `urgent`  
**Objective**: Use your lounge/interior/cigar/logo images throughout the site for credibility.
**Acceptance Criteria**
- [ ] Hero image is updated with the correct lounge interior photo
- [ ] Featured/collection images are updated
- [ ] Gallery uses the provided real photos
- [ ] All images have meaningful `alt` text
**Technical Notes**
- Add or update image assets under `src/assets/` (or `public/` if that’s the project convention).

### Issue 4 — [Bug] Fix Google Maps embed with correct coordinates
**Milestone**: Phase 1: Foundation & Content Polish  
**Labels**: `bug`, `urgent`  
**Objective**: Ensure the embedded map points to the real location.
**Acceptance Criteria**
- [ ] `Contact` page map embeds the correct address/location
- [ ] Embed loads reliably and does not show an obviously wrong pin
- [ ] `title` and `loading` attributes are present and reasonable
**Technical Notes**
- Prefer a stable embed URL and/or use the raw address when generating the embed.

### Issue 5 — [Design] Align color palette with brand logo (brown/gold warmth)
**Milestone**: Phase 1: Foundation & Content Polish  
**Labels**: `design`, `urgent`  
**Objective**: Make the site visually match the brand’s brown/gold style.
**Acceptance Criteria**
- [ ] Primary/accent colors reflect brown/gold branding (no “random” theme drift)
- [ ] Gradients (gold) look consistent across buttons/links/hero
- [ ] Contrast remains readable in dark sections
**Technical Notes**
- Prefer editing Tailwind/theme variables rather than hardcoding random hex values in components.

### Issue 6 — [Design] Polish Home / Landing page — all sections
**Milestone**: Phase 1: Foundation & Content Polish  
**Labels**: `design`, `urgent`  
**Objective**: Upgrade the landing page from prototype-quality to business-ready.
**Acceptance Criteria**
- [ ] All text reads professionally (no placeholders)
- [ ] Layout and spacing look good at mobile/tablet/desktop breakpoints
- [ ] Section headings and CTA buttons are consistent with the rest of the site
- [ ] Hero background overlay, typography scale, and animations are cohesive
**Technical Notes**
- Avoid large refactors; focus on polish and content correctness.

### Issue 7 — [Design] Polish Navbar — logo, links, mobile menu
**Milestone**: Phase 1: Foundation & Content Polish  
**Labels**: `design`, `urgent`  
**Objective**: Improve top navigation UX and ensure route links work.
**Acceptance Criteria**
- [ ] Navbar shows correct logo (or logo wordmark) and brand styling
- [ ] Desktop links navigate to correct routes
- [ ] Mobile menu opens/closes correctly and is keyboard accessible
- [ ] Active route styling is correct (if supported by the design)
**Technical Notes**
- Ensure the mobile menu does not trap focus.

### Issue 8 — [Content] Build About page with real story and ownership
**Milestone**: Phase 1: Foundation & Content Polish  
**Labels**: `content`  
**Objective**: Tell the business story in a way that builds trust.
**Acceptance Criteria**
- [ ] About page has a clear hero/intro section
- [ ] Includes “why we exist” narrative (real content provided by owner)
- [ ] Includes ownership/brand credibility (names/photos if available)
- [ ] Home links correctly to About
**Technical Notes**
- Keep copy editable so you can iterate with the business owner.

### Issue 9 — [Content] Build Cigars catalog page
**Milestone**: Phase 1: Foundation & Content Polish  
**Labels**: `content`  
**Objective**: Provide a credible cigars/menu-style page for now (static data).
**Acceptance Criteria**
- [ ] Cigars page renders a list/grid of cigars
- [ ] Each card includes required fields (at minimum: name + wrapper/strength or a similar “spec” set)
- [ ] Page has pagination or a responsive grid that doesn’t break on mobile
- [ ] The Home CTA “View All Cigars” routes correctly
**Technical Notes**
- Keep data static for Phase 1; make it easy to swap to Supabase later.

### Issue 10 — [Cancelled] Membership page — removed (not needed)
**Milestone**: Phase 1: Foundation & Content Polish  
**Labels**: `enhancement`  
**Objective**: Remove membership-page work from scope.
**Acceptance Criteria**
- [ ] No new GitHub issue is created for membership-page implementation
- [ ] No membership page review/approval step is required for launch readiness
**Technical Notes**
- If membership features are later desired, re-add them with fresh acceptance criteria.

### Issue 11 — [Content] Build Events page
**Milestone**: Phase 1: Foundation & Content Polish  
**Labels**: `content`  
**Objective**: Show upcoming events professionally with strong calls-to-action.
**Acceptance Criteria**
- [ ] Events page renders a list/grid with event date + title + description + image (if available)
- [ ] Layout is consistent with the Home “Events Preview” section
- [ ] Any CTAs link to `Contact` or a placeholder “how to attend” section
**Technical Notes**
- Use consistent component patterns (cards, headings) from existing shadcn/ui components.

### Issue 12 — [Content] Build Gallery page with real photos
**Milestone**: Phase 1: Foundation & Content Polish  
**Labels**: `content`  
**Objective**: Let customers “see the vibe” quickly.
**Acceptance Criteria**
- [ ] Gallery shows photos in a **usable, on-brand layout** (responsive; current implementation: **horizontal carousels by category** — see also **#47**)
- [ ] Images load smoothly (with `loading="lazy"` for non-critical images)
- [ ] Clicking a photo opens a **larger view** (e.g. dialog/lightbox)
- [ ] Alt text / captions are present and not generic
**Technical Notes**
- Phase 1 uses local assets (e.g. `src/assets/gallery/<category>/`). Supabase-backed gallery is **#18** (**on hold** per current Phase 2 plan).
- **#47** covers carousel UX polish (auto-scroll direction alternation, edge fades, reduced-motion fallback).

### Issue 13 — [Content] Build Contact page with hours and map
**Milestone**: Phase 1: Foundation & Content Polish  
**Labels**: `content`  
**Objective**: Provide clear contact options and a high-conversion contact form UX (no backend yet).
**Acceptance Criteria**
- [ ] Contact page includes business address, phone, hours, and map
- [ ] Contact form validates user input (client-side validation)
- [ ] Form submit shows a success state (even if it only simulates submission for now)
- [ ] Contact CTA buttons work (call/link/map)
**Technical Notes**
- Phase 2 may later persist submissions to Supabase; until an issue implements that, submission can remain “fake submit” with a clear message or `mailto:` — see `Phase_2_implementation_plan.md` (contact on hold unless prioritized).

--- 

### Issue 14 — [Backend] Supabase schema design — contact and events
**Milestone**: Phase 2: Active backend / data layer  
**Labels**: `backend`  
**Objective**: Define tables and constraints so the backend integration is predictable (align with `Phase_2_implementation_plan.md` — events + bookings + auth/roles first; contact persistence on hold unless reopened).
**Acceptance Criteria**
- [ ] Table list includes: `contact_submissions` and `events`
- [ ] Basic indexes exist for lookup by created time and/or email (as appropriate)
- [ ] Row-level security strategy is documented (what is public vs private)
**Technical Notes**
- `membership_leads` (or similar) is **future work** only if a membership system is explicitly scoped — not part of current product scope.
- Prefer new focused issues for schema slices (events, bookings, profiles, admin roles) under Phase 2.

### Issue 15 — [Backend] Contact form → saves submissions to Supabase
**Status**: On hold unless product re-prioritizes (see `Phase_2_implementation_plan.md`)  
**Milestone**: Phase 2: Active backend / data layer  
**Labels**: `backend`  
**Objective**: Persist contact submissions.
**Acceptance Criteria**
- [ ] Contact form writes to the correct Supabase table
- [ ] Success/failure states are correct and user-friendly
- [ ] Validation prevents bad data from reaching DB
**Technical Notes**
- Ensure the client uses anon key and RLS policies allow inserts.

### Issue 16 — [Backend] Membership waitlist / signup → saves to Supabase
**Status: Deferred — On hold for Phase 2 current plan**  
**Milestone**: Phase 2: Active backend / data layer  
**Labels**: `backend`  
**Objective**: Persist membership interest (only if membership is explicitly re-scoped later).
**Acceptance Criteria**
- [ ] Membership form writes to the correct Supabase table
- [ ] Duplicate emails are handled (either allowed, deduped, or rejected—document choice)
- [ ] UI shows clear “we got it” message
**Technical Notes**
- Start only after Issue 14 schema is confirmed.

### Issue 17 — [Backend] Events table — dynamic events on Events page
**Milestone**: Phase 2: Active — high priority  
**Labels**: `backend`  
**Objective**: Load events from Supabase.
**Acceptance Criteria**
- [ ] Events page fetches from Supabase using TanStack Query
- [ ] Events are displayed in a stable order (e.g., date ascending)
- [ ] Loading and empty states are handled
**Technical Notes**
- Keep the API fetching logic in `src/lib/` and reuse across components if needed.

### Issue 18 — [Backend] Gallery table — dynamic photo gallery management
**Status**: On hold unless product re-prioritizes  
**Milestone**: Phase 2: Active backend / data layer  
**Labels**: `backend`  
**Objective**: Load gallery entries from Supabase for later CMS-like workflows.
**Acceptance Criteria**
- [ ] Gallery page fetches gallery records from Supabase
- [ ] Empty and error states are handled
- [ ] Image URLs are stored/retrieved correctly (Storage vs public URLs)
**Technical Notes**
- In Phase 2, define whether you store images in Supabase Storage or only store references.

### Issue 19 — [Feature] Admin dashboard scaffold (manage events, gallery, inquiries)
**Milestone**: Phase 2: Active — high priority (CRUD for events first; gallery/inquiries per plan)  
**Labels**: `enhancement`  
**Objective**: Create an admin workflow (later) for managing content.
**Acceptance Criteria**
- [ ] Admin area exists (route + basic UI scaffold)
- [ ] Admin can view lists for at least events and contact submissions
- [ ] Create/edit actions are stubbed or implemented depending on scope
**Technical Notes**
- Requires auth strategy later; start only when ready to finalize RLS/access rules.

--- 

### Issue 20 — [Docs] Configure Vercel deployment with env vars
**Milestone**: Phase 3: Launch Prep  
**Labels**: `documentation`, `urgent`  
**Objective**: Ensure the site can be deployed reliably.
**Current status (repo):** `vercel.json` SPA rewrites + deploy/env documentation in `README.md`. **Remaining:** Vercel dashboard — link GitHub repo, set Production/Preview env vars, confirm production URL.
**Acceptance Criteria**
- [ ] Vercel project is created and connected to the GitHub repo
- [ ] Build and preview succeed (`npm run build`)
- [ ] Any required environment variables are documented (even if currently minimal)
- [ ] Deployment produces a working URL
**Technical Notes**
- Phase 2 requires Supabase (and related) env vars in Vercel for preview/production when features ship; document in `README.md` / ops issues as you enable them.

### Issue 21 — [Enhancement] SEO — meta tags, Open Graph, sitemap
**Milestone**: Phase 3: Launch Prep  
**Labels**: `enhancement`  
**Objective**: Improve discoverability and link previews.
**Current status (repo):** Per-route `Seo` + `react-helmet-async`; `public/sitemap.xml`; `robots.txt` sitemap line; `public/og-preview.jpg`. Re-check after canonical domain / deploy changes.
**Acceptance Criteria**
- [ ] Baseline SEO meta tags exist (title/description, etc.)
- [ ] Open Graph tags exist for correct social previews
- [ ] `sitemap.xml` and `robots.txt` are present and correct
- [ ] Page routes don’t produce obvious “missing meta” issues
**Technical Notes**
- If per-route meta is needed, choose a lightweight solution (avoid adding unnecessary dependencies).

### Issue 22 — [Enhancement] Performance audit — image optimization, lazy loading
**Milestone**: Phase 3: Launch Prep  
**Labels**: `enhancement`  
**Objective**: Ensure fast load times on mobile.
**Current status (repo):** Route-level code splitting (`lazy` + `Suspense`); lazy `loading` on many images. **Optional:** formal Lighthouse pass, heavier compression, hero/video weight review.
**Acceptance Criteria**
- [ ] Images use lazy loading where appropriate
- [ ] Largest images are optimized (dimensions, formats, compression approach)
- [ ] Lighthouse (or similar) shows improved performance vs baseline
**Technical Notes**
- Keep changes small and measurable.

### Issue 23 — [Enhancement] Accessibility audit (a11y)
**Milestone**: Phase 3: Launch Prep  
**Labels**: `enhancement`  
**Objective**: Ensure accessibility basics are met.
**Current status (repo):** Skip link + `#main-content`; 404 uses `Layout`; gallery tiles keyboard-activatable; age gate `role="dialog"` + labelled headings. **Remaining:** full automated/manual audit (forms, contrast, focus traps).
**Acceptance Criteria**
- [ ] Forms have labels and useful error messaging
- [ ] Keyboard navigation works for key flows (nav, CTAs, forms)
- [ ] Color contrast is acceptable for text
- [ ] Landmark/semantic structure is reasonable (headings, sections)
**Technical Notes**
- Use an accessibility checker; don’t guess. Fix the highest-impact issues.

### Issue 24 — [Bug] Mobile responsiveness QA pass
**Milestone**: Phase 3: Launch Prep  
**Labels**: `bug`, `urgent`  
**Objective**: Ensure the site looks and works well on phones.
**Current status (repo):** Responsive layouts across pages; **Remaining:** device QA after deploy (real phones/tablets).
**Acceptance Criteria**
- [ ] No major layout breakages on common breakpoints
- [ ] Navbar + hero + cards don’t overflow or become unreadable
- [ ] Tap targets are usable
**Technical Notes**
- Verify with both real-device sizes and emulator/browser devtools.

### Issue 25 — [Content] Final content review with business owner
**Milestone**: Phase 3: Launch Prep  
**Labels**: `content`, `urgent`  
**Objective**: Get approval and make final text/image adjustments before launch.
**Current status (repo):** `LAUNCH_CHECKLIST.md` — owner-driven; not implemented in code.
**Acceptance Criteria**
- [ ] Owner reviews all pages: Home, About, Cigars, Events, Gallery, Contact
- [ ] Contact details, hours, and addresses are confirmed
- [ ] Final “go live” checklist is completed
**Technical Notes**
- Track feedback with GitHub Issues so changes are auditable.

### Issue 26 — [Enhancement] Analytics tracking setup
**Milestone**: Phase 3: Launch Prep  
**Labels**: `enhancement`  
**Objective**: Track user behavior and key actions.
**Current status (repo):** `AnalyticsScripts` + `trackEvent` for Plausible/GA (`README.md` env vars); enable via Vercel env in production.
**Acceptance Criteria**
- [ ] Page views are tracked
- [ ] CTA clicks (directions/contact) are tracked
- [ ] Lightweight analytics solution implemented (Google Analytics or Plausible)
**Technical Notes**
- Prefer minimal script weight and privacy-conscious defaults where possible.

---

## Additional issues (#44–#47, #81)

Backlog entries for GitHub issues outside the original **1–26** range; keep in sync with `IMPLEMENTATION_PLAN.md` Phase 1.6 and recent product work.

### Issue 44 — [Design] Simplify hero section — minimal layout
**Milestone**: Phase 1.6  
**Labels**: `design`  
**Objective**: Cleaner hero, single strong CTA, less clutter.  
**Link**: https://github.com/maximus34530/cigar-society-genesis/issues/44  

### Issue 45 — [Content] About — real owners, founding story, credibility
**Milestone**: Phase 1.6  
**Labels**: `content`  
**Objective**: Trust-building About content (names, narrative, certifications/reviews as applicable).  
**Link**: https://github.com/maximus34530/cigar-society-genesis/issues/45  

### Issue 46 — [Design] Hide Cigars and Contact from navbar
**Milestone**: Phase 1.6  
**Labels**: `design`  
**Objective**: Nav visibility only; preserve routes.  
**Link**: https://github.com/maximus34530/cigar-society-genesis/issues/46  

### Issue 47 — [Design] Gallery — carousel layout
**Milestone**: Phase 1.6  
**Labels**: `design`  
**Objective**: Horizontal carousels, brand-consistent chrome, mobile-friendly interaction.  
**Link**: https://github.com/maximus34530/cigar-society-genesis/issues/47  
**Technical Notes**: See Phase 1.6 table above for implementation summary.

### Issue 81 — [Design] 21+ age verification entry gate
**Milestone**: Launch-adjacent / compliance (assign on GitHub as you prefer)  
**Labels**: `design`, `enhancement`  
**Objective**: First-visit age gate before SPA routes; optional remember-me (session vs extended local storage).  
**Current status (repo):** `src/components/AgeGate.tsx`, `src/lib/ageGateStorage.ts`, integrated in `src/App.tsx` (blocks router until verified).  
**Acceptance Criteria**
- [ ] Gate blocks main site until user confirms 21+
- [ ] “Remember me” behavior matches product intent (documented)
- [ ] Underage path and Surgeon General copy reviewed for legal/compliance
- [ ] Keyboard / reduced-motion behavior acceptable
**Technical Notes**
- No production `console.log`; keep tokens/secrets out of repo (see Issue 1 MCP notes).

