# Partner handoff — Phase 2 continuation

**Repo**: `maximus34530/cigar-society-genesis`  
**Business**: Cigar Society, LLC — Pharr, TX  
**Purpose**: Orient a collaborator (Cursor, Antigravity, or human) so work continues without losing process or scope.

---

## Context (one minute)

The site is **React + Vite + TypeScript + Tailwind + shadcn/ui**. **Phase 1** (marketing site) is largely complete. **Phase 2 is active**: authenticated **user dashboard**, **admin CRUD** (events first), **public Events** backed by **Supabase**, then **payments**. **Membership**, **contact form → database**, and **gallery CMS** stay **on hold** — use “coming soon” in UI only until re-prioritized.

Default git branch for this work: **`Phase-2`**. Do **not** push routine work directly to **`main`**.

---

## Read first (order matters)

1. **`GITHUB_ISSUES_GUIDE.md`** — Issues-first workflow, when to close vs ask, **approve-before-commit**, no agent pushes to `main`.
2. **`Phase_2_implementation_plan.md`** — Epics **A→E**, on-hold areas, suggested issue breakdown.
3. **`IMPLEMENTATION_PLAN.md`** — Phase 2 summary table and tech decisions.
4. **`GITHUB_ISSUES_BACKLOG.md`** — Historical issue IDs; cross-check GitHub for **open** work before duplicating.
5. **`.cursor/rules/project.mdc`** — Cursor/agent rules (mirrors workflow + code standards).

Optional: **`README.md`** (scripts, env), **`SYSTEM_OVERVIEW.md`** (target architecture), **`CLAUDE_HANDOFF.md`** (broader AI context).

---

## Step-by-step before you code

1. **Pull latest**: `git fetch && git checkout Phase-2 && git pull`.
2. **Install**: `npm install`.
3. **Environment**: Copy `.env.example` → `.env.local`. Add Supabase URL + publishable/anon key (`VITE_*` — see README). Never commit `.env.local` or secrets.
4. **GitHub**: Open [Issues](https://github.com/maximus34530/cigar-society-genesis/issues) — search for your task; avoid duplicate issues.
5. **Create or claim an issue** with **Objective**, **Acceptance criteria**, **Definition of done** (template in `GITHUB_ISSUES_GUIDE.md`). Default for agents: **create an issue** unless the owner says not to.

---

## While coding

- Use **shadcn/ui** from `@/components/ui/`, **Tailwind** + CSS variables from `index.css` (no random hex).
- **Supabase (browser)**: `src/lib/supabase.ts` — never ship **service role** or payment **secret** keys in `VITE_*`.
- **Forms**: React Hook Form + Zod.
- **Server/async state**: **TanStack Query** when wiring Supabase (add `@tanstack/react-query` if not yet in `package.json` — see `IMPLEMENTATION_PLAN.md`).
- Prefer **small, reviewable** changes tied to one issue.

---

## When you’re done

1. Run **`npm run build`** (and **`npm run lint`** / tests if you touched logic).
2. Confirm **acceptance criteria** on the issue.
3. **Close the issue** on GitHub if everything is clearly done; **otherwise ask** the repo owner.
4. **Commit and push only after explicit owner approval**:
   - `git add …`
   - `git commit -m "[#NN] Short description"`
   - `git push origin Phase-2`
5. **Do not** commit or merge to **`main`** unless the owner explicitly says so.

---

## Current priority (what to build next)

Per **`Phase_2_implementation_plan.md`**:

1. **Epic A** — User dashboard **UI shell** (routes, layout, empty states); auth wired in a later epic.
2. **Epic B** — Admin **events CRUD** UI (then Supabase).
3. **Epic C** — Public **Events** page from real data.
4. **Epic D** — Supabase **schema, Auth, RLS**, wire admin + user + events.
5. **Epic E** — **Payments** (e.g. Stripe) after core auth/data.

**First concrete milestone**: account area routes + responsive layout + intentional empty states (see Epic A exit criteria in the plan).

---

## Cursor / MCP (optional)

- **Supabase MCP**: local `.cursor/mcp.json` (gitignored) — add the hosted MCP URL from Supabase for this project if you use Cursor tools against the DB.
- **GitHub MCP**: use for listing/creating/updating issues in line with `GITHUB_ISSUES_GUIDE.md`.

---

## Links

- **Issues**: https://github.com/maximus34530/cigar-society-genesis/issues  
- **Repo**: https://github.com/maximus34530/cigar-society-genesis  

---

## Keeping this file current

When Phase 2 priorities or branch strategy change, update this file in the same **issue + commit** workflow as other docs.
