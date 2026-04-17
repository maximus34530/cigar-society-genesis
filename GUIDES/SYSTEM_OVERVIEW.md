# Cigar Society Website System

## Frontend

* React + Vite + Tailwind + shadcn/ui

## Backend (Phase 2 — active)

* **Supabase** (Postgres, Auth, RLS) for events, bookings, and dashboard data
* **Payment provider** (e.g. Stripe) planned after core auth and data — see `Phase_2_implementation_plan.md`

## Phase 1 (shipped)

* Static marketing site; contact form **simulated** (no DB persistence until re-prioritized)

## Deployment

* Vercel

## Data Flow (target for Phase 2)

* Public site → read published content (e.g. events) from Supabase
* User dashboard → authenticated reads/writes per RLS
* Admin dashboard → CRUD for managed entities (events first)
* Contact form / membership / gallery CMS → **on hold** or “coming soon” until separate issues

**Detail**: `Phase_2_implementation_plan.md`, `IMPLEMENTATION_PLAN.md`, `GITHUB_ISSUES_GUIDE.md`
