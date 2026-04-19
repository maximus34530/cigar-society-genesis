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

## Verify the PAT (no secrets in logs)

From the **repo root**, GitHub must accept the token Docker loads from `.env.local`:

```bash
docker run --rm --env-file .env.local curlimages/curl:latest sh -c \
  'curl -sS -o /dev/null -w "http_code=%{http_code}\\n" -H "Authorization: Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}" https://api.github.com/user'
```

- **`http_code=200`** — credential is valid for `api.github.com`; GitHub MCP should work after a Cursor restart.
- **`http_code=401`** — GitHub rejects this token (revoked, wrong account, or not the value you think is loaded). Fix the value in `.env.local` or **authorize SSO** for org tokens (GitHub → token settings → SSO).
- **`http_code=403`** — often **missing scopes** for what MCP is doing (start with `repo` + `read:user` for classic PATs; adjust for fine-grained).

If Cursor’s cwd is not the repo root, use an **absolute** path in `.cursor/mcp.json` for `--env-file` (see committed `.cursor/mcp.json.example` vs your local `.cursor/mcp.json`).

## Security
- Do NOT put the token value inside `.cursor/mcp.json`
- `.cursor/mcp.json` should reference only environment variable names
- Keep real secrets in `.env.local` only

