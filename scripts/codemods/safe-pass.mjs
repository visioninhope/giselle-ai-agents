#!/usr/bin/env node
/**
 * safe-pass.mjs
 *
 * Aggregated safe codemods pipeline (dry-run by default)
 * - Targets: JSX class names, CSS @apply, SVG fill/stroke class usages
 * - Strategy: STRICT string replacement only (no regex that could overreach)
 * - Default: dry-run summary JSON per each replacement, with totals
 *
 * Usage:
 *   node scripts/codemods/safe-pass.mjs              # dry-run
 *   node scripts/codemods/safe-pass.mjs --apply      # write changes
 *   node scripts/codemods/safe-pass.mjs --ext ts,tsx,jsx,css,svg --apply
 *   node scripts/codemods/safe-pass.mjs --root . --apply
 *
 * Notes:
 * - Keep replacements minimal and obviously safe. Glass areas must be excluded by pattern.
 */

import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import process from "node:process";

const DEFAULT_EXTS = ["ts", "tsx", "jsx", "js", "css", "scss", "svg", "mdx"];
const DEFAULT_IGNORE_DIRS = new Set([
	"node_modules",
	".git",
	".next",
	"dist",
	"build",
	"out",
	"coverage",
]);

// Exclude glass areas (conservative; extend as needed)
const EXCLUDE_PATH_SUBSTRINGS = ["/glass/", "/frosted/"];

/** Safe replacements table */
const REPLACEMENTS = [
	// Text colors
	{ from: "text-white-900", to: "text-inverse" },
	{ from: "text-black-600/20", to: "text-text/20" },
	// Backgrounds and borders (semantic first)
	{ from: "bg-white", to: "bg-bg" },
	{ from: "bg-black", to: "bg-bg" },
	// Border (inverse -> semantic)
	{ from: "border-white-900/20", to: "border-border/20" },
	{ from: "border-white-900/15", to: "border-border/15" },
	{ from: "border-white-900/10", to: "border-border/10" },
	{ from: "border-white-900", to: "border-border" },
	{ from: "border-gray-200", to: "border-border-muted" },
	{ from: "border-gray-700", to: "border-border" },
	// SVG common classes
	{ from: "fill-white-900", to: "fill-inverse" },
	{ from: "stroke-white-900", to: "stroke-inverse" },
];

function parseArgs(argv) {
	const args = {
		root: process.cwd(),
		exts: DEFAULT_EXTS,
		apply: false,
		verbose: false,
	};
	for (let i = 2; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--root") {
			args.root = argv[++i] ?? args.root;
		} else if (a === "--ext" || a === "--exts") {
			const v = argv[++i];
			if (v)
				args.exts = v
					.split(",")
					.map((s) => s.trim())
					.filter(Boolean);
		} else if (a === "--apply") {
			args.apply = true;
		} else if (a === "--verbose") {
			args.verbose = true;
		}
	}
	return args;
}

async function* walk(dir, allowExts, rootDir) {
	const entries = await readdir(dir, { withFileTypes: true });
	for (const ent of entries) {
		const p = resolve(dir, ent.name);
		if (ent.isDirectory()) {
			if (DEFAULT_IGNORE_DIRS.has(ent.name)) continue;
			yield* walk(p, allowExts, rootDir);
		} else if (ent.isFile()) {
			const ext = ent.name.split(".").pop();
			if (!ext || !allowExts.includes(ext)) continue;
			const rel = relative(rootDir, p);
			if (EXCLUDE_PATH_SUBSTRINGS.some((s) => rel.includes(s))) continue;
			yield p;
		}
	}
}

function replaceAllCount(haystack, needle, replacement) {
	if (!haystack.includes(needle))
		return { changed: false, count: 0, content: haystack };
	const parts = haystack.split(needle);
	const count = parts.length - 1;
	const content = parts.join(replacement);
	return { changed: true, count, content };
}

async function run() {
	const args = parseArgs(process.argv);
	const root = args.root;
	const exts = args.exts;

	let scannedFiles = 0;
	const summaryByPair = new Map();
	for (const { from, to } of REPLACEMENTS) {
		summaryByPair.set(`${from} -> ${to}`, {
			changedFiles: 0,
			totalReplacements: 0,
			changes: [],
		});
	}

	for await (const file of walk(root, exts, root)) {
		scannedFiles++;
		let content;
		try {
			const st = await stat(file);
			if (!st.isFile()) continue;
			content = await readFile(file, "utf8");
		} catch {
			continue;
		}

		let next = content;
		let touched = false;
		for (const { from, to } of REPLACEMENTS) {
			const before = next;
			const {
				changed,
				count,
				content: after,
			} = replaceAllCount(next, from, to);
			if (!changed) continue;
			next = after;
			touched = true;
			const k = `${from} -> ${to}`;
			const entry = summaryByPair.get(k);
			entry.changedFiles++;
			entry.totalReplacements += count;
			if (args.verbose)
				entry.changes.push({ file: relative(root, file), count });
		}

		if (touched && args.apply && next !== content) {
			await writeFile(file, next, "utf8");
		}
	}

	const output = {
		root,
		exts,
		apply: args.apply,
		scannedFiles,
		replacements: Object.fromEntries(
			Array.from(summaryByPair.entries()).map(([k, v]) => [k, v]),
		),
	};

	console.log(JSON.stringify(output, null, 2));
	if (!args.apply) {
		console.log(
			"\n[dry-run] No files were modified. Re-run with --apply to write changes.",
		);
	}
}

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
