#!/usr/bin/env node
/**
 * Non-blocking code color guard for TS/TSX.
 * - Warns on literal colors in code (hex, rgb/rgba, hsl/hsla, oklch)
 * - Warns on Tailwind direct black/white color scales inside class strings (bg-*, border-*, text-*)
 * - Output is human-readable; exits with code 0 (intended as CI warning only)
 */

import { spawnSync } from "node:child_process";

function hasRg() {
  const res = spawnSync("rg", ["--version"], { encoding: "utf8" });
  return res.status === 0 && String(res.stdout).includes("ripgrep");
}

function runRg(pattern, globs) {
  const args = [
    "-n",
    "-i",
    "--hidden",
    "--json",
  ];
  // Include only TS/TSX by default
  const include = globs?.include ?? ["**/*.ts", "**/*.tsx"]; 
  const exclude = globs?.exclude ?? [
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/dist/**",
    "!**/build/**",
    "!**/out/**",
    "!**/coverage/**",
  ];
  for (const g of exclude) args.push("--glob", g);
  for (const g of include) args.push("--glob", g);
  args.push("-e", pattern);
  const res = spawnSync("rg", args, { encoding: "utf8" });
  if (res.status !== 0 && res.status !== 1) {
    return { items: [], error: res.stderr || "rg failed" };
  }
  const items = [];
  for (const line of String(res.stdout || "").split("\n")) {
    if (!line.trim()) continue;
    let ev;
    try { ev = JSON.parse(line); } catch { continue; }
    if (ev?.type !== "match") continue;
    const m = ev.data;
    if (!m?.path?.text || !m?.lines?.text) continue;
    items.push({ path: m.path.text, line: m.line_number, text: m.lines.text.trim() });
  }
  return { items };
}

function print(section, results) {
  if (results.items.length === 0) return;
  console.log(`\n[lint:colors:code] ${section}: ${results.items.length} findings`);
  for (const it of results.items.slice(0, 50)) {
    console.log(` - ${it.path}:${it.line}: ${it.text}`);
  }
  if (results.items.length > 50) {
    console.log(`   ... and ${results.items.length - 50} more`);
  }
}

(function main() {
  if (!hasRg()) {
    console.log("[lint:colors:code] ripgrep not found; skipping.");
    process.exit(0);
  }

  // 1) Literal colors in code
  const hex = runRg("#[0-9a-fA-F]{3,4}\\b|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8}");
  const func = runRg("\\b(?:rgba?|hsla?|oklch)\\s*\\(");

  // 2) Tailwind direct black/white scales inside class strings
  //    e.g. "bg-black-900", "text-white-400", "border-white/10"
  const tw = runRg("\\b(?:text|bg|border)-(?:black|white)(?:-[0-9]{1,3})?(?:\\/[0-9]{1,3})?\\b");

  print("hex colors in TS/TSX", hex);
  print("functional colors in TS/TSX (rgb/rgba/hsl/hsla/oklch)", func);
  print("Tailwind direct black/white scales in class strings", tw);

  const total = (hex.items?.length || 0) + (func.items?.length || 0) + (tw.items?.length || 0);
  if (total === 0) {
    console.log("[lint:colors:code] No issues found.");
  } else {
    console.log(`\n[lint:colors:code] Summary: ${total} findings. (non-blocking)`);
  }
  // Always exit 0: warn-only
  process.exit(0);
})();


