# GitHub Issues Backlog — Cigar Society Website

**Repo**: `cigar-society-genesis`  
**Business**: `Cigar Society, LLC` (Pharr, TX)  
**Source**: `IMPLEMENTATION_PLAN.md` + current decisions (Supabase is back-burner for now).

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
- Where the plan used “Phase 2 Supabase integration”, keep those issues labeled `backend` but mark them as **Back Burner**.

## Milestones

1. **Phase 1: Foundation & Content Polish**
   - Issues: 1–13
2. **Phase 2 (Back Burner): Supabase Backend Integration**
   - Issues: 14–19
3. **Phase 3: Launch Prep**
   - Issues: 20–25

--- 

## Issues (1–25)

### Issue 1 — [Docs] Set up GitHub labels, milestones, and Cursor rules
**Milestone**: Phase 1: Foundation & Content Polish  
**Labels**: `documentation`, `urgent`  
**Objective**: Ensure the project workflow is consistent and professional before major UI/content edits.
**Acceptance Criteria**
- [ ] GitHub labels exist and match the names in `GITHUB_ISSUES_GUIDE.md`
- [ ] Milestones exist for Phase 1 / Phase 2 (Back Burner) / Phase 3
- [ ] Cursor rules file(s) are in place and reflect the repo workflow expectations
- [ ] A default issue template/workflow is clearly documented (link to `GITHUB_ISSUES_GUIDE.md`)
**Technical Notes**
- If you use GitHub MCP later, issue operations should reference these labels/milestones.

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

### Issue 10 — [Feature] Build Membership page — tiers and benefits
**Milestone**: Phase 1: Foundation & Content Polish  
**Labels**: `enhancement`  
**Objective**: Create a membership page that communicates value clearly.
**Acceptance Criteria**
- [ ] Membership tiers/benefits are displayed (even if initially using static placeholder tiers provided by owners)
- [ ] “La Sociedad” branding is applied consistently
- [ ] CTAs route correctly to the membership CTA flow (or contact page if no signup backend)
- [ ] Page layout is polished and readable
**Technical Notes**
- If you don’t have real tier pricing yet, avoid inventing prices; use “Coming soon” or “Contact us”.

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
- [ ] Gallery page shows a responsive photo grid
- [ ] Images load smoothly (with `loading="lazy"` for non-critical images)
- [ ] Clicking a photo (if implemented) shows it in a larger view
- [ ] Alt text is present and not generic
**Technical Notes**
- No need for Supabase storage in Phase 1; use local assets/public images.

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
- Since Supabase is back burner, submission can be “fake submit” with a clear message, or wire to `mailto:` if preferred.

--- 

### Issue 14 — [Backend] Supabase schema design — contact, membership, events
**Milestone**: Phase 2 (Back Burner): Supabase Backend Integration  
**Labels**: `backend`  
**Objective**: Define tables and constraints so the backend integration is predictable later.
**Acceptance Criteria**
- [ ] Table list includes: `contact_submissions`, `membership_leads`, and `events`
- [ ] Basic indexes exist for lookup by created time and/or email (as appropriate)
- [ ] Row-level security strategy is documented (what is public vs private)
**Technical Notes**
- Start only when you explicitly re-enable Supabase integration.

### Issue 15 — [Backend] Contact form → saves submissions to Supabase
**Milestone**: Phase 2 (Back Burner): Supabase Backend Integration  
**Labels**: `backend`  
**Objective**: Persist contact submissions.
**Acceptance Criteria**
- [ ] Contact form writes to the correct Supabase table
- [ ] Success/failure states are correct and user-friendly
- [ ] Validation prevents bad data from reaching DB
**Technical Notes**
- Ensure the client uses anon key and RLS policies allow inserts.

### Issue 16 — [Backend] Membership waitlist / signup → saves to Supabase
**Milestone**: Phase 2 (Back Burner): Supabase Backend Integration  
**Labels**: `backend`  
**Objective**: Persist membership interest.
**Acceptance Criteria**
- [ ] Membership form writes to the correct Supabase table
- [ ] Duplicate emails are handled (either allowed, deduped, or rejected—document choice)
- [ ] UI shows clear “we got it” message
**Technical Notes**
- Start only after Issue 14 schema is confirmed.

### Issue 17 — [Backend] Events table — dynamic events on Events page
**Milestone**: Phase 2 (Back Burner): Supabase Backend Integration  
**Labels**: `backend`  
**Objective**: Load events from Supabase.
**Acceptance Criteria**
- [ ] Events page fetches from Supabase using TanStack Query
- [ ] Events are displayed in a stable order (e.g., date ascending)
- [ ] Loading and empty states are handled
**Technical Notes**
- Keep the API fetching logic in `src/lib/` and reuse across components if needed.

### Issue 18 — [Backend] Gallery table — dynamic photo gallery management
**Milestone**: Phase 2 (Back Burner): Supabase Backend Integration  
**Labels**: `backend`  
**Objective**: Load gallery entries from Supabase for later CMS-like workflows.
**Acceptance Criteria**
- [ ] Gallery page fetches gallery records from Supabase
- [ ] Empty and error states are handled
- [ ] Image URLs are stored/retrieved correctly (Storage vs public URLs)
**Technical Notes**
- In Phase 2, define whether you store images in Supabase Storage or only store references.

### Issue 19 — [Feature] Admin dashboard scaffold (manage events, gallery, inquiries)
**Milestone**: Phase 2 (Back Burner): Supabase Backend Integration  
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
**Acceptance Criteria**
- [ ] Vercel project is created and connected to the GitHub repo
- [ ] Build and preview succeed (`npm run build`)
- [ ] Any required environment variables are documented (even if currently minimal)
- [ ] Deployment produces a working URL
**Technical Notes**
- Supabase env vars can be skipped until Phase 2 is enabled.

### Issue 21 — [Enhancement] SEO — meta tags, Open Graph, sitemap
**Milestone**: Phase 3: Launch Prep  
**Labels**: `enhancement`  
**Objective**: Improve discoverability and link previews.
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
**Acceptance Criteria**
- [ ] Owner reviews all pages: Home, About, Cigars, Membership, Events, Gallery, Contact
- [ ] Contact details, hours, and addresses are confirmed
- [ ] Final “go live” checklist is completed
**Technical Notes**
- Track feedback with GitHub Issues so changes are auditable.

