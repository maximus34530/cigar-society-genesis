# Cursor Agent Bundle (Reusable)

This folder is a reusable setup kit for Cursor-based AI collaboration.

What it provides:
- Standard workflow docs for professional GitHub Issues usage
- Cursor rules so agents follow the workflow consistently
- MCP configuration templates (GitHub MCP; Supabase can be enabled later)
- Helper scripts to verify GitHub authentication + (optionally) seed issues from a backlog

Recommended usage for a new project:
1. Create a new repo/workspace folder.
2. Run the installer script (or tell the AI to run it) so this bundle is installed into the new repo root:
   - `node cursor-agent-bundle/scripts/install-agent-bundle.mjs --target <NEW_REPO_ROOT> --force`
3. Add `.env.local` with `GITHUB_PERSONAL_ACCESS_TOKEN`.
4. Restart Cursor and run a quick verification prompt (or run `node cursor-agent-bundle/scripts/verify-github-auth.mjs` from the new repo).

