# MCP Setup (GitHub MCP)

## Requirements
- Docker installed and running
- A GitHub Personal Access Token (PAT) with permissions to the repo

## Step-by-step
1. Create `/.env.local` (in the *repo root*, not committed):
   - `GITHUB_PERSONAL_ACCESS_TOKEN=...`
2. Ensure the repo has `.cursor/mcp.json` (created from the bundle template).
3. Restart Cursor so MCP configuration + env vars are reloaded.
4. In Cursor chat, verify GitHub MCP works by asking to list/search issues.

## Security
- Do NOT put the token value inside `.cursor/mcp.json`
- `.cursor/mcp.json` should reference only environment variable names
- Keep real secrets in `.env.local` only

