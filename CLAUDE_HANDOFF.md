# Cigar Society — Claude Handoff (Current State)

Last updated: 2026-03-19

## Project Overview
- Repo: `maximus34530/cigar-society-genesis`
- App type: React + Vite + TypeScript + Tailwind + shadcn/ui marketing site
- Business: Cigar Society (display name), legal name kept as Cigar Society, LLC in business constants where appropriate
- Current branch checked out locally: `main`
- Working tree: clean

## Important Workflow Context
- User and partner collaborate via GitHub.
- Standard process has been issue-first with commit format `[#ID] message`.
- Historically work was done on branch `March-19,-2026`, then merged to `main`.
- User requested no coding changes right now; currently in planning/brainstorming for next phase.

## What Is Already Implemented

### Routing and Homepage
- `HomeV2` is now the default homepage route at `/`.
- Previous homepage remains available as backup at `/home-v1`.
- `/home-v2` route still exists and points to `HomeV2`.
- File: `src/App.tsx`

### Home V2 Video Hero
- Uses one uploaded `.MOV` file as hero video.
- Video behavior: autoplay, muted, loop, playsInline.
- Reduced-motion fallback shows static hero image.
- Files:
  - `src/pages/HomeV2.tsx`
  - `src/lib/business.ts`
  - `public/videos/copy_99474A51-7078-450C-937E-34DEB928683E.MOV`

### CTA Directions Behavior
- "Visit the Lounge" CTA on both home variants opens map directions.
- Logic:
  - Apple devices -> Apple Maps
  - Others -> Google Maps directions
- Destination matching uses business name + full address for accuracy.
- Files:
  - `src/lib/business.ts`
  - `src/pages/HomeV2.tsx`
  - `src/pages/Index.tsx`

### Metadata / SEO Updates
- Title and description updated from old "Cigar Society US" phrasing to current "Cigar Society" branding.
- Added OG + Twitter card tags.
- Added `og:image`/`twitter:image` pointing to `/og-preview.jpg` URL (image file can be added/replaced later).
- JSON-LD business name aligned and outdated email removed.
- File: `index.html`

### Favicon / Tab Icon
- Replaced old favicon set (old Loveable icon) with generated Cigar Society icon set from logo:
  - `public/favicon.ico`
  - `public/favicon-16x16.png`
  - `public/favicon-32x32.png`
  - `public/apple-touch-icon.png`
- Added favicon link tags in `index.html`.

### Content and UX Work Previously Completed
- Membership page removed from current scope and navigation.
- Navbar polish and mobile behavior improvements.
- Gallery lightbox improvement.
- Contact page CTA and map/phone improvements.
- Events/About/Index real content updates.
- Business constants centralized.
- Route additions and structure cleaned up.

## Key Files to Review First
- `IMPLEMENTATION_PLAN.md` (source-of-truth plan updates)
- `GITHUB_ISSUES_GUIDE.md` (workflow expectations)
- `src/lib/business.ts` (business constants and map links)
- `src/App.tsx` (route mapping)
- `src/pages/HomeV2.tsx` and `src/pages/Index.tsx` (hero CTA behavior)
- `index.html` (SEO/meta/favicon tags)

## Recent Git State / Commits
- Latest commits on `main`:
  - `c6ab25c` `[#20] Replace favicon with Cigar Society icon set`
  - `d25daf9` `[#19] Update branding metadata and social preview tags`
  - `889bc43` merge of PR from `March-19,-2026`
- Feature commits from previous branch include issues `#14` to `#17` (home-v2, routing promotion, directions CTA, destination fix).

## Recent GitHub Issues (Relevant)
- #14 Home v2 video hero
- #15 Promote Home v2 as default homepage
- #16 Hero CTA to maps directions
- #17 Destination accuracy fix
- #19 Metadata and social preview update
- #20 Favicon replacement

## Known Notes / Caveats
- Social previews are cached by platforms. If preview image/title seems old, run platform cache refresh tools.
- Browser favicons are aggressively cached; hard refresh may be needed after deploy.
- `og:image` currently points to `/og-preview.jpg`; add/replace that file to control exact social card image.

## Business Conversation Context (Current)
Owner liked current website and asked for larger product scope:
- Admin panel for cigars/events management
- Marketplace to buy event tickets and cigars
- 21+ authorization
- Monthly membership

This is significantly beyond brochure-site scope and should be treated as a phased product proposal (not per-page pricing).

## Suggested Next Discussion Agenda (No Coding Yet)
1. Define scope as phases (MVP commerce first, membership second, marketing automation third).
2. Clarify compliance and payment constraints:
   - Tobacco sales/legal constraints
   - Age verification depth (simple gate vs ID verification service)
   - Payment provider and fees
   - Event refund policy
3. Confirm operational workflows:
   - Who manages inventory/events in admin
   - Need for POS sync vs website-only catalog
4. Price as package + monthly support, not page-based.

## If Claude Should Continue in Planning Mode
Ask Claude to produce:
- A 3-phase delivery plan with scope boundaries
- Build vs buy recommendations for:
  - Admin/CMS
  - E-commerce
  - Membership billing
  - Age verification
- A pricing model (homie rate + sustainable maintenance)
- A client-facing proposal draft and discovery-question checklist

