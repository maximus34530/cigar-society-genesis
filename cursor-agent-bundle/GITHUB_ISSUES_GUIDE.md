# GitHub Issues & Workflow Guide for AI Agents (Reusable)

## ⚠️ Prime Directive
No code changes are committed without a corresponding GitHub Issue.

## Issue Structure Template
**Title**: `[Type] Concise Description`

**Body**:
```markdown
## Objective
[Brief description of what needs to be achieved]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Technical Notes
- [Optional: Brief note on implementation strategy]
```

## Execution Rules
- Branching:
  - Preferred is one branch per issue.
  - If you are using a fixed existing branch, do not create new branches; commit on the current branch.
- Commits:
  - Every commit message must reference the GitHub issue ID.
  - Format: `[#ISSUE_ID] Commit message`
- PR + Issue closing:
  - PR creation/merge and GitHub issue closing are handled manually by the user.

## Standard Labels (recommended)
- `enhancement`
- `bug`
- `documentation`
- `refactor`
- `urgent`
- `content`
- `design`
- `backend`

