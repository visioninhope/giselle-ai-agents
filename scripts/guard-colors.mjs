#!/usr/bin/env node
/**
 * Warning-level color guard (non-blocking)
 * - Runs report-colors and prints GitHub Actions warnings for raw color usages
 * - Excludes known safe files (e.g., tokens.css)
 */

import { spawnSync } from "node:child_process";

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

function main() {
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

	// Print as GitHub Actions warnings
	for (const f of findings) {
		const msg =
			"Avoid raw colors. Prefer tokens/semantic utilities (e.g., text-text, text-inverse).";
		// ::warning file=...,line=...::message
		console.log(`::warning file=${f.path},line=${f.line}::${msg}`);
	}

	console.log(`[guard-colors] Total warnings: ${findings.length}`);
}

main();
