#!/usr/bin/env node
/**
 * Warning-level color guard (non-blocking by default)
 * - Runs report-colors and prints GitHub Actions warnings for raw color usages
 * - Excludes known safe files (e.g., tokens.css)
 * - Optional baseline comparison: only warn on new findings vs a baseline file
 * - Optional --strict to exit non-zero when there are new findings
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

/** @param {string} p */
function isExcluded(p) {
	// tokens/primitives, vendor assets, build outputs
	const exclude = [
		"/internal-packages/ui/styles/tokens.css",
		"/node_modules/",
		"/.next/",
		"/dist/",
		"/build/",
		"/out/",
		"/coverage/",
	];
	return exclude.some((mark) => p.includes(mark));
}

/** Parse CLI args */
function parseArgs(argv) {
	const args = { baseline: undefined, strict: false };
	for (let i = 2; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--baseline") {
			const v = argv[i + 1];
			if (!v || v.startsWith("--")) {
				console.error("[guard-colors] --baseline requires a path argument");
				process.exit(0);
			}
			args.baseline = v;
			i++;
		} else if (a === "--strict") {
			args.strict = true;
		}
	}
	return args;
}

/** @param {{ path: string, line: number, match: string }} f */
function findingKey(f) {
	return `${f.path}:${f.line}:${f.match}`;
}

function main() {
	const { baseline, strict } = parseArgs(process.argv);

	const res = spawnSync("node", ["scripts/report-colors.mjs"], {
		encoding: "utf8",
	});
	if (res.status !== 0) {
		console.error("[guard-colors] report-colors failed");
		process.exit(0); // non-blocking
	}
	let report;
	try {
		report = JSON.parse(res.stdout || "{}");
	} catch (_e) {
		console.error("[guard-colors] failed to parse report JSON");
		process.exit(0);
	}

	/** @type {Array<{ path: string, line: number, match: string, context: string }>} */
	const findings = [];
	for (const item of report.findings?.hexColors || []) {
		if (!isExcluded(item.path)) findings.push(item);
	}
	for (const item of report.findings?.functionalColors || []) {
		if (!isExcluded(item.path)) findings.push(item);
	}

	if (findings.length === 0) {
		console.log("[guard-colors] No raw color findings");
		return;
	}

	/** Baseline comparison (optional) */
	/** @type {Set<string> | undefined} */
	let baselineKeys;
	if (baseline) {
		if (!existsSync(baseline)) {
			console.warn(
				`{guard-colors] Baseline not found at ${baseline}. Proceeding without baseline.`,
			);
		} else {
			try {
				const raw = readFileSync(baseline, "utf8");
				const base = JSON.parse(raw || "{}");
				const baseFindings = [];
				for (const item of base.findings?.hexColors || [])
					baseFindings.push(item);
				for (const item of base.findings?.functionalColors || [])
					baseFindings.push(item);
				baselineKeys = new Set(baseFindings.map((f) => findingKey(f)));
			} catch (_e) {
				console.warn(
					"[guard-colors] Failed to read/parse baseline. Proceeding without baseline.",
				);
			}
		}
	}

	const toWarn = baselineKeys
		? findings.filter((f) => !baselineKeys.has(findingKey(f)))
		: findings;

	if (toWarn.length === 0) {
		console.log("[guard-colors] No new raw color findings vs baseline");
		return;
	}

	// Print as GitHub Actions warnings
	for (const f of toWarn) {
		const msg =
			"Avoid raw colors. Prefer tokens/semantic utilities (e.g., text-text, text-inverse).";
		// ::warning file=...,line=...::message
		console.log(`::warning file=${f.path},line=${f.line}::${msg}`);
	}

	console.log(
		`[guard-colors] Total warnings: ${toWarn.length}${baselineKeys ? " (new vs baseline)" : ""}`,
	);

	if (strict && toWarn.length > 0) {
		process.exit(1);
	}
}

main();
