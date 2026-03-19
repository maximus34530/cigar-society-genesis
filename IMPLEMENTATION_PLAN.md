# Implementation Plan — Cigar Society Website

**Business**: Cigar Society, LLC  
**Address**: 116 W State Ave, Pharr, TX 78577  
**Phone**: (956) 223-1303  
**Stack**: React 18 · Vite · TypeScript · Tailwind CSS · shadcn/ui · Supabase  
**Collaborators**: Ethan (Cursor) · Partner (Antigravity)  
**Repo**: `cigar-society-genesis`

---

## Workflow Rules

- Every task has a GitHub Issue before any code is written
- Branch naming: `feat/issue-ID-short-description`
- Commit format: `[#ID] message`
- All merges to `main` via Pull Request
- Reference `GITHUB_ISSUES_GUIDE.md` for full protocol

---

## Phase 1 — Foundation & Content Polish
*Goal: Replace placeholder content with real business data, align the design to the Cigar Society brand (brown/gold), and remove membership-page scope until later.*

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

**Phase 1 Progress (completed so far):** Issues `#1–#6` are complete (workflow setup, business identity/contact updates, map embed, gold palette alignment, landing page polish, and membership UI removal).

---

## Phase 2 — Supabase Backend Integration
*Goal: Add dynamic, database-backed features using the already-connected Supabase MCP.*

| # | Issue | Label | Priority |
|---|---|---|---|
| 14 | Supabase schema design — tables for contact, membership, events | `backend` | 🔴 Urgent (phase start) |
| 15 | Contact form → saves submissions to Supabase | `backend` | 🟠 High |
| 16 | Membership waitlist / signup → saves to Supabase | `backend` | 🟠 High |
| 17 | Events table — dynamic events on Events page | `backend` | 🟡 Medium |
| 18 | Gallery table — dynamic photo gallery management | `backend` | 🟡 Medium |
| 19 | Admin dashboard scaffold (manage events, gallery, inquiries) | `enhancement` | 🟢 Low |

**Phase 2 Definition of Done**: Forms submit real data to Supabase; at least contact submissions are live.

---

## Phase 3 — Launch Prep
*Goal: Harden the site for public launch.*

| # | Issue | Label | Priority |
|---|---|---|---|
| 20 | Configure Vercel deployment with env vars | `chore` | 🔴 Urgent (phase start) |
| 21 | SEO — meta tags, Open Graph, sitemap | `enhancement` | 🟠 High |
| 22 | Performance audit — image optimization, lazy loading | `enhancement` | 🟡 Medium |
| 23 | Accessibility audit (a11y) | `enhancement` | 🟡 Medium |
| 24 | Mobile responsiveness QA pass | `bug` | 🟠 High |
| 25 | Final content review with business owner | `content` | 🟠 High |

**Phase 3 Definition of Done**: Site is live on a custom domain, fast, SEO-ready, and approved by the business owner.

---

## Real Business Data (Reference)

```
Business Name:  Cigar Society, LLC
Address:        116 W State Ave, Pharr, TX 78577
Phone:          (956) 223-1303
Rating:         5.0 ★ (27 Google Reviews)
Hours:          Closes 11 PM (full hours TBD)
Branding:       Brown/gold, "La Sociedad" membership sub-brand
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
| Backend | Supabase | MCP already connected |
| Deployment | Vercel | Best DX for Vite/React |
| State/Data | TanStack Query | Already in package.json |
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
