import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execSync } from "node:child_process";

function parseEnvFile(envPath) {
  const out = {};
  const text = envPath ? envPath : "";
  return out;
}

async function loadDotEnvLocal(repoRoot) {
  const envPath = path.join(repoRoot, ".env.local");
  let text = "";
  try {
    text = await fs.readFile(envPath, "utf8");
  } catch {
    return { missingEnv: true };
  }

  const env = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim();
    env[key] = val;
  }

  return { env };
}

function inferRepoFromGit(repoRoot) {
  const url = execSync("git config --get remote.origin.url", {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
  // Supports:
  // - https://github.com/owner/repo.git
  // - git@github.com:owner/repo.git
  const m1 = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/);
  const m2 = url.match(/git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/);
  const m = m1 || m2;
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

async function main() {
  const repoRoot = process.cwd();
  const { env, missingEnv } = await loadDotEnvLocal(repoRoot);
  if (missingEnv) {
    console.log("Missing .env.local. Create it from .env.local.example first.");
    process.exit(0);
  }

  const token = env.GITHUB_PERSONAL_ACCESS_TOKEN || env.GITHUB_TOKEN;
  if (!token) {
    console.log("Missing GITHUB_PERSONAL_ACCESS_TOKEN (or GITHUB_TOKEN) in .env.local.");
    process.exit(0);
  }

  const inferred = inferRepoFromGit(repoRoot);
  const repoEnv = env.GITHUB_REPOSITORY || "";
  const [ownerFromEnv, repoFromEnv] = repoEnv.split("/");
  const owner = ownerFromEnv || (inferred ? inferred.owner : null);
  const repo = repoFromEnv || (inferred ? inferred.repo : null);

  if (!owner || !repo) {
    console.log("Could not infer repo. Set GITHUB_REPOSITORY=owner/repo in .env.local.");
    process.exit(0);
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "verify-github-auth",
    },
  });
  const user = await userRes.json();

  if (!userRes.ok) {
    console.log("GitHub authentication failed:", user && user.message ? user.message : userRes.status);
    process.exit(1);
  }

  console.log(`Authenticated as: ${user.login}`);

  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "verify-github-auth",
    },
  });
  const repoData = await repoRes.json();

  if (!repoRes.ok) {
    console.log(`Repo access failed for ${owner}/${repo}:`, repoData && repoData.message ? repoData.message : repoRes.status);
    process.exit(1);
  }

  console.log(`Repo access OK: ${repoData.full_name}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

