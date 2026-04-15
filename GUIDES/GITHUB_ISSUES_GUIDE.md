# GitHub Issues & Workflow Guide for AI Agents

**Project**: `cigar-society-genesis`  
**Repository**: `maximus34530/cigar-society-genesis`  
**Business**: Cigar Society, LLC — Pharr, TX  
**Objective**: Maintain a rigorous, transparent, and up-to-date history of all work, decisions, and progress across a two-person team (Cursor + Antigravity).

**Phase 2**: Active — see `Phase_2_implementation_plan.md` and `IMPLEMENTATION_PLAN.md`.

---

## GitHub repository snapshot (synchronize with live data)

Agents should treat **GitHub as source of truth** for issue state. To refresh counts and open work, use **GitHub** (web UI) or **GitHub MCP** `list_issues` on `owner: maximus34530`, `repo: cigar-society-genesis` (supports open, closed, and pagination).

**Last full enumeration (API / MCP)**: 2026-04-06 — **77** issues total (**1** open, **76** closed).

| State | Count (as of snapshot) | Notes |
|------|-------------------------|--------|
| **Open** | 1 | Example: `#83` — Supabase connection docs / env / client scaffold |
| **Closed** | 76 | Includes Phase 1 delivery, design/content polish, roadmap placeholders `#25–#36`, and duplicate or superseded titles for the same theme (e.g. hero/gallery/navbar). |

**Practical guidance**

- **Search before creating** — Many themes already have closed issues; link or reopen only when starting new work.
- **Roadmap issues** `#25–#36` are **closed** in GitHub but describe **future** Phase 2–4 intent; current Phase 2 execution is driven by `Phase_2_implementation_plan.md` and **new issues** you create for each task.
- **Duplicate issue numbers** are normal over time (e.g. repeated “[Design] Gallery carousel”); use **issue number + title** when referencing work.

---

## Prime Directive

**All work must be tracked in a GitHub Issue.** No task runs without an issue.

---

## 1. Initialization (Start of Task)

Before writing any code or planning detailed implementation:

1. **Search**: Look for existing issues related to the user’s request (GitHub search or MCP `search_issues` / `list_issues`).
2. **Create (default)**: **Automatically create a new issue** for the task at hand if one does not exist—**unless** the user explicitly says not to create issues for that request.
3. **Update (if found)**: If an issue exists but is outdated, update it with new context.

### Issue structure template

**Title**: Use a **type prefix in brackets** (matches repo history), then a short description.

*Common prefixes seen in this repo*: `Feature`, `Bug`, `Design`, `Content`, `Docs`, `Chore`, `Fix`, `UX`, `Phase 1`, `Phase 2`, etc.

**Body**:
```markdown
## Objective
[Brief description of what needs to be achieved]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Definition of Done

* [ ] Feature works in production build
* [ ] No console errors
* [ ] Mobile and desktop verified

## Technical Notes
- [Optional: Brief note on implementation strategy]
```

---

## 2. Execution (During Work)

- **Branching**: Preferred is one branch per issue.
  - Naming: `feat/issue-ID-short-description` or `fix/issue-ID-short-description`
  - Examples: `feat/3-real-business-content`, `fix/7-maps-embed`
- If you are using a **fixed working branch** (e.g. `Phase-2`) instead, do not create a new branch for every issue unless the team asks; **still** reference the issue ID in commits and in the issue body.
- **Commits**: When the user has approved a commit (see §3), every commit message must reference the issue ID.
  - Format: `[#ISSUE_ID] Commit message`
  - Example: `[#3] Add real phone number, hours, and address`
- **Pull Requests**: PR creation/merge is handled manually by the human team unless they explicitly ask otherwise.
- **`main` branch**: **Never commit to `main` and never push directly to `main`** from routine agent work. All work lands on the agreed feature/working branch; merging to `main` is a human decision (usually via PR).  
  - *Exception*: Older issues in the repo (e.g. some Phase 1 SEO items) note **direct commit to `main` requested by user** — follow **current** explicit user instruction if it conflicts with historical issue notes.

---

## 3. Completion, issues, commits, and sync

### Closing issues

After implementation:

1. **Verify** acceptance criteria and definition of done against the issue.
2. **If everything is clearly satisfied** — **close the GitHub issue** and briefly note what was delivered (comment optional).
3. **If anything is ambiguous** (criteria unclear, partial delivery, or product sign-off needed) — **do not assume**: **ask the user** whether the issue should be closed or updated.

**Note on history**: Issue `#70` once proposed doc updates to “always close when verified.” **Current team policy** is the three bullets above: close when unambiguously done; otherwise ask. If docs and GitHub ever conflict, **this section wins** until the team updates it.

### Commits and sync (human approval required)

1. When work is ready, **ask the user** whether to **commit** and **sync (push)** to the current branch.
2. **Only after explicit approval** — stage, commit with `[#ID] …`, and push to the **current working branch** (never `main` unless the user gives an explicit, exceptional instruction to do so).

---

## 4. Labels — standard guide + observed on GitHub

Apply labels that match the work. The repo **actively uses** the following (from issue history); prefer these over inventing new names:

| Label | Use |
|------|-----|
| `enhancement` | New features or improvements |
| `bug` | Errors or broken functionality |
| `documentation` | README, guides, MCP/setup, handoff docs |
| `refactor` | Code cleanup without behavior change |
| `urgent` | Blocks critical workflows (use when appropriate; not always present on past issues) |
| `content` | Copy, images, real business data |
| `design` | Visual/UI changes, styling |
| `backend` | Supabase, database, edge functions, integrations |
| `feature` | User-facing feature work (used alongside `design`/`content` on multiple issues) |
| `chore` | Maintenance/setup tasks (appears with `refactor` on e.g. `#50`) |
| `phase-1` | Scoped to Phase 1 track when you want a milestone filter (e.g. `#49`) |

If GitHub is missing a label you need, create it in the repo settings or use the closest existing label and note the gap in the issue.

---

## 5. Branch protection (recommended)

- `main` is the production branch — always deployable
- No direct pushes to `main`; all changes via PR
- Both collaborators review before merging (optional for solo work)

---

## 6. Agent instructions (system prompt injection)

*When you (the AI Agent) read this file, you must:*

1. Track **all** work via GitHub Issues (create by default unless the user opts out for that task).
2. **List or search GitHub** (`maximus34530/cigar-society-genesis`) for related issues before creating duplicates.
3. Use branch naming conventions **or** the team’s fixed working branch; always tie work to an issue ID in commits **after approval**.
4. **Do not** commit, push, or merge without the user’s explicit approval for that action; **never** target `main` without an explicit exception.
5. After work: **close the issue** when criteria are unambiguously met; **otherwise ask** the user whether to close or adjust the issue.
6. Do not open PRs or merge into `main` automatically unless the user explicitly asks.
