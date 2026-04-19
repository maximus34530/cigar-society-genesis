import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function parseEnv(text) {
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
  return env;
}

function colorForLabel(label) {
  // GitHub label colors are hex without '#'
  const map = {
    enhancement: "3b82f6",
    bug: "ef4444",
    documentation: "f97316",
    refactor: "a855f7",
    urgent: "dc2626",
    content: "10b981",
    design: "f59e0b",
    backend: "6366f1",
    chore: "6b7280",
  };
  return map[label] ?? "6b7280";
}

function getIssueBlock(backlogText, matchIndexStart, matchIndexEnd) {
  return backlogText.slice(matchIndexStart, matchIndexEnd).trim();
}

function extractBetween(block, startRegex, endRegex) {
  const start = block.match(startRegex);
  if (!start) return null;
  const startIdx = start.index + start[0].length;
  const rest = block.slice(startIdx);
  const endMatch = rest.match(endRegex);
  if (!endMatch) return rest.trim();
  const endIdx = endMatch.index;
  return rest.slice(0, endIdx).trim();
}

async function main() {
  const repoRoot = process.cwd();
  const backlogPath = path.join(repoRoot, "GUIDES", "GITHUB_ISSUES_BACKLOG.md");
  const envPath = path.join(repoRoot, ".env.local");

  const dryRun = process.argv.includes("--dry-run");
  const limit = (() => {
    const idx = process.argv.indexOf("--limit");
    if (idx === -1) return null;
    const n = Number(process.argv[idx + 1]);
    return Number.isFinite(n) ? n : null;
  })();

  const backlogText = await fs.readFile(backlogPath, "utf8");
  const envText = await fs.readFile(envPath, "utf8").catch(() => null);
  if (!envText) throw new Error("Missing .env.local. Create it from .env.local.example.");
  const env = parseEnv(envText);

  const token = env.GITHUB_PERSONAL_ACCESS_TOKEN || env.GITHUB_TOKEN;
  if (!token) throw new Error("Missing GITHUB_PERSONAL_ACCESS_TOKEN (or GITHUB_TOKEN) in .env.local");

  const repoEnv = env.GITHUB_REPOSITORY || "";
  const [owner, repo] = repoEnv.split("/");
  if (!owner || !repo) {
    throw new Error("Missing GITHUB_REPOSITORY=owner/repo in .env.local");
  }

  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const headers = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "seed-issues-from-backlog",
  };

  async function ghGet(url) {
    const res = await fetch(url, { headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`GET ${url} failed: ${res.status} ${data && data.message ? data.message : ""}`);
    return data;
  }
  async function ghPost(url, payload) {
    if (dryRun) return { dryRun: true };
    const res = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`POST ${url} failed: ${res.status} ${data && data.message ? data.message : ""}`);
    return data;
  }

  // Parse backlog milestones + issues
  const milestoneTitles = new Set();
  for (const m of backlogText.matchAll(/^###\s+Issue\s+(\d+)\s+—\s+.*$/gm)) {
    // milestones parsed per issue below
    void m;
  }

  const issueHeaderRegex = /^###\s+Issue\s+(\d+)\s+—\s+(.+)$/gm;
  const issueMatches = [...backlogText.matchAll(issueHeaderRegex)];
  if (!issueMatches.length) throw new Error("No issues found in GUIDES/GITHUB_ISSUES_BACKLOG.md");

  const issuesParsed = [];
  for (let i = 0; i < issueMatches.length; i++) {
    const m = issueMatches[i];
    const backlogId = Number(m[1]);
    const title = m[2].trim();
    const start = m.index;
    const end = i + 1 < issueMatches.length ? issueMatches[i + 1].index : backlogText.length;
    const block = getIssueBlock(backlogText, start, end);

    const milestoneMatch = block.match(/\*\*Milestone\*\*:\s*([^\n]+)/);
    const labelsLineMatch = block.match(/\*\*Labels\*\*:\s*([^\n]+)/);
    const objectiveMatch = block.match(/\*\*Objective\*\*:\s*([^\n]+)/);

    const labels = new Set();
    if (labelsLineMatch) {
      for (const lm of labelsLineMatch[1].matchAll(/`([^`]+)`/g)) labels.add(lm[1]);
    }

    const milestone = milestoneMatch ? milestoneMatch[1].trim() : null;
    if (milestone) milestoneTitles.add(milestone);

    // Acceptance Criteria block is between "**Acceptance Criteria**" and "**Technical Notes**"
    // Fallback: if those markers don't exist, body will be empty.
    const acceptanceBlock = extractBetween(
      block,
      /\*\*Acceptance Criteria\*\*([\s\S]*?)/,
      /\*\*Technical Notes\*\*/
    );

    const technicalBlock = extractBetween(
      block,
      /\*\*Technical Notes\*\*:\s*([\s\S]*?)/,
      /$/ // till end
    );

    const objective = objectiveMatch ? objectiveMatch[1].trim() : "";

    // Compose a clean issue body for GitHub
    const bodySections = [
      "## Objective",
      objective || "(not provided)",
      "",
      "## Acceptance Criteria",
      acceptanceBlock
        ? acceptanceBlock.replace(/^\s*-\s*\[ \]\s?/gm, "- [ ] ")
        : "(not provided)",
      "",
      "## Technical Notes",
      technicalBlock || "(not provided)",
      "",
      "---",
      `Backlog ID: ${backlogId}`,
    ];

    issuesParsed.push({
      backlogId,
      title,
      milestone,
      labels: [...labels],
      body: bodySections.join("\n"),
    });
  }

  issuesParsed.sort((a, b) => a.backlogId - b.backlogId);
  const selectedIssues = limit ? issuesParsed.slice(0, limit) : issuesParsed;

  // Fetch existing labels/milestones/issues (first 100)
  const existingLabels = await ghGet(`${baseUrl}/labels?per_page=100`);
  const labelsByName = new Map(existingLabels.map((l) => [l.name, l]));

  const existingMilestones = await ghGet(`${baseUrl}/milestones?state=all&per_page=100`);
  const milestoneByTitle = new Map(existingMilestones.map((m) => [m.title, m]));

  const existingIssues = await ghGet(`${baseUrl}/issues?state=all&per_page=100`);
  const issuesByTitle = new Map(
    existingIssues
      .filter((it) => !it.pull_request)
      .map((it) => [it.title, it])
  );

  // Ensure labels
  const allLabels = new Set();
  for (const it of selectedIssues) for (const l of it.labels) allLabels.add(l);
  for (const label of allLabels) {
    if (!labelsByName.has(label)) {
      const color = colorForLabel(label);
      const created = await ghPost(`${baseUrl}/labels`, { name: label, color, description: `${label} label` });
      if (!dryRun && created && created.name) labelsByName.set(created.name, created);
    }
  }

  // Ensure milestones
  for (const title of milestoneTitles) {
    if (!milestoneByTitle.has(title)) {
      const created = await ghPost(`${baseUrl}/milestones`, {
        title,
        description: title,
      });
      if (!dryRun && created && created.number != null) milestoneByTitle.set(created.title, created);
    }
  }

  const issueNumberMap = {};

  // Create missing issues
  for (const it of selectedIssues) {
    const existing = issuesByTitle.get(it.title);
    if (existing) {
      issueNumberMap[it.backlogId] = existing.number;
      continue;
    }

    const milestoneNumber = it.milestone ? (milestoneByTitle.get(it.milestone)?.number ?? null) : null;
    const payload = {
      title: it.title,
      body: it.body,
      labels: it.labels,
    };
    if (milestoneNumber != null) payload.milestone = milestoneNumber;

    const created = await ghPost(`${baseUrl}/issues`, payload);
    if (dryRun) {
      console.log(`[dry-run] would create: ${it.title}`);
    } else {
      issueNumberMap[it.backlogId] = created.number;
      console.log(`Created: #${created.number} (backlog ${it.backlogId})`);
    }
  }

  const mapPath = path.join(repoRoot, "ISSUE_NUMBER_MAP.md");
  if (!dryRun) {
    const lines = ["# Issue Number Map", ""];
    for (const it of selectedIssues) {
      const createdNumber = issueNumberMap[it.backlogId];
      if (createdNumber != null) lines.push(`- Backlog #${it.backlogId} -> GitHub Issue #${createdNumber}`);
    }
    await fs.writeFile(mapPath, lines.join("\n") + "\n", "utf8");
  } else {
    console.log("Dry run complete; no map written.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

