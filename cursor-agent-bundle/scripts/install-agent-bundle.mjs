import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const bundleRoot = path.join(__dirname, "..");

function getArg(flag, defaultValue) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return defaultValue;
  const next = process.argv[idx + 1];
  return next ? next : defaultValue;
}

const targetPath = path.resolve(getArg("--target", process.cwd()));
const force = process.argv.includes("--force");

const filesToCopy = [
  {
    from: path.join(bundleRoot, "..", "GUIDES", "GITHUB_ISSUES_GUIDE_reusable.md"),
    to: path.join(targetPath, "GITHUB_ISSUES_GUIDE.md"),
  },
  {
    from: path.join(bundleRoot, ".env.local.example"),
    to: path.join(targetPath, ".env.local.example"),
  },
  {
    from: path.join(bundleRoot, ".cursor", "mcp.json.example"),
    to: path.join(targetPath, ".cursor", "mcp.json.example"),
  },
  {
    from: path.join(bundleRoot, ".cursor", "mcp.json.example"),
    to: path.join(targetPath, ".cursor", "mcp.json"),
    // Ensure .cursor/mcp.json exists for the agent; secrets should NOT be embedded.
  },
  {
    from: path.join(bundleRoot, ".cursor", "rules", "project.mdc"),
    to: path.join(targetPath, ".cursor", "rules", "project.mdc"),
  },
];

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function copyFileSafely({ from, to }) {
  const destDir = path.dirname(to);
  await ensureDir(destDir);

  try {
    await fs.access(to);
    if (!force) {
      console.log(`[skip] exists: ${path.relative(targetPath, to)}`);
      return;
    }
  } catch {
    // file doesn't exist
  }

  await fs.copyFile(from, to);
  console.log(`[copy] ${path.relative(targetPath, to)}`);
}

async function ensureGitignoreEntry() {
  const gitignorePath = path.join(targetPath, ".gitignore");
  let current = "";
  try {
    current = await fs.readFile(gitignorePath, "utf8");
  } catch {
    // If .gitignore doesn't exist, create it.
    await ensureDir(path.dirname(gitignorePath));
  }

  const entry = ".cursor/mcp.json";
  if (!current.includes(entry)) {
    current = (current ? current.trimEnd() + "\n\n" : "") + `# Cursor MCP (keep token-bearing local config out of commits)\n${entry}\n`;
    await fs.writeFile(gitignorePath, current, "utf8");
    console.log("[write] .gitignore entry for .cursor/mcp.json");
  } else {
    console.log("[skip] .gitignore already contains .cursor/mcp.json");
  }
}

async function main() {
  console.log(`Target: ${targetPath}`);
  await Promise.all(filesToCopy.map(copyFileSafely));
  await ensureGitignoreEntry();
  console.log("Done. Restart Cursor and set GITHUB_PERSONAL_ACCESS_TOKEN in .env.local.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

