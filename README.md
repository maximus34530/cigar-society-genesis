# Cigar Society — Website

Premium cigar lounge site for **Cigar Society, LLC** (Pharr, TX).

**Stack:** React 18 · Vite · TypeScript · Tailwind CSS · shadcn/ui · React Router

## Scripts

```bash
npm install
npm run dev      # http://localhost:8080
npm run build
npm run preview
npm run lint
npm test
```

## Deploy (Vercel) — Issue 20

1. Import the GitHub repo in [Vercel](https://vercel.com).
2. Framework preset: **Vite**. Build: `npm run build`, output: `dist`.
3. `vercel.json` includes SPA rewrites so client routes work in production.
4. Set environment variables (see below), redeploy, and verify the production URL.

## Environment variables

Copy `.env.example` to `.env.local` for local testing. In Vercel, add the same keys for Production (and Preview if desired).

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_SITE_ORIGIN` | No | Canonical / OG base URL (default: `https://cigarsocietyus.com`) |
| `VITE_PLAUSIBLE_DOMAIN` | No | Plausible analytics domain (e.g. `cigarsocietyus.com`) |
| `VITE_GA_MEASUREMENT_ID` | No | Google Analytics 4 measurement ID (`G-…`) |

## Project docs

- `IMPLEMENTATION_PLAN.md` — Phases and scope
- `GITHUB_ISSUES_GUIDE.md` — Issue workflow
- `GITHUB_ISSUES_BACKLOG.md` — Issue backlog
- `SYSTEM_OVERVIEW.md` — Architecture summary
- `LAUNCH_CHECKLIST.md` — Owner sign-off (Issue 25)

## Analytics

Set **`VITE_PLAUSIBLE_DOMAIN`** (site hostname, e.g. `cigarsocietyus.com`) and/or **`VITE_GA_MEASUREMENT_ID`** (GA4 `G-…` ID) in Vercel or `.env.local`. When set, `src/components/AnalyticsScripts.tsx` injects the matching script on load. CTAs call `trackEvent()` in `src/lib/analytics.ts` (home/contact hero directions, phone and map on contact, phone and social links in the footer). Plausible receives the human-readable event name; GA4 receives a slug derived from that name plus the same string props (`location`, `platform`, etc.). Register custom dimensions in GA4 if you want to report those params in explorations.

## SEO

- Per-route titles and meta: `src/components/Seo.tsx` (react-helmet-async)
- Static files: `public/sitemap.xml`, `public/robots.txt`
- Social preview image: `public/og-preview.jpg` (update asset if branding changes)
