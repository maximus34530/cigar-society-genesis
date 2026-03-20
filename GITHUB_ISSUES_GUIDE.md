# GitHub Issues & Workflow Guide for AI Agents

**Project**: `cigar-society-genesis`
**Business**: Cigar Society, LLC — Pharr, TX
**Objective**: Maintain a rigorous, transparent, and up-to-date history of all work, decisions, and progress across a two-person team (Cursor + Antigravity).

---

## ⚠️ Prime Directive
**No code changes are committed without a corresponding GitHub Issue.** Taking 30 seconds to track work saves hours of confusion later.

---

## 1. Initialization (Start of Task)

Before writing any code or planning detailed implementation:

1. **Search**: Look for existing issues related to the user's request.
2. **Create (if not found)**: Create a new issue if one does not exist.
3. **Update (if found)**: If an issue exists but is outdated, update it with new context.

### Issue Structure Template

**Title**: `[Type] Concise Description`
*Types*: `Feature`, `Bug`, `Refactor`, `Docs`, `Chore`, `Content`, `Design`

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
- If you are using a fixed existing branch (e.g. `March-19, 2026`) instead, do not create new branches; just ensure commits still reference the issue ID.
- **Commits**: All commit messages must reference the issue ID.
  - Format: `[#ISSUE_ID] Commit message`
  - Example: `[#3] Add real phone number, hours, and address`
- **Pull Requests**: PR creation/merge is handled manually by you.
  - The agent will not open PRs or merge into `main` unless you explicitly instruct otherwise.

---

## 3. Completion (End of Task)

1. **Verification**: Ensure all Acceptance Criteria **and** the **Definition of Done** checklist in the issue body are satisfied.
2. **Issue Status**: Leave the GitHub issue open unless you explicitly ask me to close it.
3. **User Handoff**: Provide a concise summary of what was changed and how it satisfies the acceptance criteria, so you can review, PR, merge, and close manually.

---

## 4. Standard Labels

| Label | Use |
|---|---|
| `enhancement` | New features or improvements |
| `bug` | Errors or broken functionality |
| `documentation` | README, guides, code comments |
| `refactor` | Code cleanup without logic change |
| `urgent` | Blocks critical workflows |
| `content` | Copy, images, real business data |
| `design` | Visual/UI changes, styling |
| `backend` | Supabase, database, edge functions |

---

## 5. Branch Protection (Recommended)

- `main` is the production branch — always deployable
- No direct pushes to `main`; all changes via PR
- Both collaborators review before merging (optional for solo work)

---

## 6. Agent Instructions (System Prompt Injection)

*When you (the AI Agent) read this file, you must:*
1. Acknowledge that you will track your work via GitHub Issues.
2. Ask the user for the specific Issue ID if you cannot find one, or ask for permission to create it.
3. Create a branch named per the convention above before making changes, unless you are using a fixed existing branch (your instruction). In that case, commit on the current branch.
4. Reference the issue in every commit message.
5. Update issue status (add comment, check off criteria) only if you explicitly ask me to.
6. Do not open PRs or merge into `main` automatically.
