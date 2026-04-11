#!/usr/bin/env node
/**
 * Builds JSON payloads for Supabase MCP `deploy_edge_function` (one file per function).
 * Run from repo root: node scripts/build-mcp-edge-bundles.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function bundle(name, extraFiles) {
  const dir = path.join(root, "supabase/functions", name);
  const files = [
    { name: "index.ts", content: fs.readFileSync(path.join(dir, "index.ts"), "utf8") },
    { name: "deno.json", content: fs.readFileSync(path.join(dir, "deno.json"), "utf8") },
    ...extraFiles.map((rel) => ({
      name: rel,
      content: fs.readFileSync(path.join(dir, rel), "utf8"),
    })),
  ];
  // Gateway verify_jwt rejects ES256 session JWTs; stripe-webhook uses Stripe signatures.
  // create-* / finalize-* validate Authorization in-function via auth.getUser().
  const verify_jwt = false;
  // MCP deploy_edge_function expects import_map_path when deno.json is used, or deploy can 500.
  const import_map_path = "deno.json";
  return { name, entrypoint_path: "index.ts", import_map_path, verify_jwt, files };
}

const outDir = path.join(root, "scripts/.mcp-edge-bundles");
fs.mkdirSync(outDir, { recursive: true });

const payloads = [
  bundle("create-checkout-session", ["_shared/cors.ts"]),
  bundle("finalize-checkout-session", ["_shared/cors.ts", "_shared/receipt.ts"]),
  bundle("stripe-webhook", ["_shared/receipt.ts"]),
];

for (const p of payloads) {
  fs.writeFileSync(path.join(outDir, `${p.name}.json`), JSON.stringify(p));
}

console.log(`Wrote ${payloads.length} bundles to ${outDir}`);
