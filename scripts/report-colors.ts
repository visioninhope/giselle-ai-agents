/**
 * Color usage report (rg-based)
 *
 * Generates a JSON report summarizing color-related usages across the repo:
 * - Tailwind color utilities (text-*, bg-*, border-*, ring-*, outline-*, divide-*, from-*, via-*, to-*, fill-*, stroke-*)
 * - Specific key items: text-white-900, text-black-600/20, color-border-focused
 * - Color literals: hex (#fff/#ffffff/#ffffffff), rgba()/hsla()/hsl()/oklch()
 * - CSS variables: --color-*, --brand-*, --text-*, --bg-*, --surface-*, --border-*, --ring-*, --shadow-*
 * - SVG attributes: fill= / stroke= (in *.svg files only)
 *
 * By default, the report is printed to stdout.
 * Optionally, write to a file with: `pnpm tsx scripts/report-colors.ts --out .reports/report-colors.json`
 *
 * Notes:
 * - Requires ripgrep (`rg`) to be installed and available on PATH.
 * - Excludes common build/output directories: node_modules, .next, dist, build, out, coverage
 * - Searches common source extensions: css, scss, ts, tsx, js, jsx, svg, md, mdx (except for the SVG-only query)
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

type RgEvent =
	| { type: "begin"; data: unknown }
	| { type: "match"; data: RgMatch }
	| { type: "end"; data: unknown }
	| { type: string; data: unknown };

type RgMatch = {
	path: { text: string };
	lines: { text: string };
	line_number: number;
	absolute_offset: number;
	submatches: Array<{ start: number; end: number; match: { text: string } }>;
};

type Finding = {
	path: string;
	line: number;
	match: string;
	context: string;
};

type CategoryReport = {
	regex: string;
	totalMatches: number;
	fileCount: number;
	findings: Finding[];
};

type SpecialItemsReport = {
	textWhite900: Finding[];
	textBlack600_20: Finding[];
	colorBorderFocused: Finding[];
};

type Report = {
	generatedAt: string;
	rootDir: string;
	options: {
		caseInsensitive: boolean;
		excludeGlobs: string[];
		includeGlobs: string[];
	};
	patterns: {
		tailwindUtilities: Omit<CategoryReport, "findings"> & { preview: Finding[] };
		specific: Omit<CategoryReport, "findings"> & { preview: Finding[] };
		hexColors: Omit<CategoryReport, "findings"> & { preview: Finding[] };
		functionalColors: Omit<CategoryReport, "findings"> & { preview: Finding[] };
		cssVariables: Omit<CategoryReport, "findings"> & { preview: Finding[] };
		svgAttrs: Omit<CategoryReport, "findings"> & { preview: Finding[] };
	};
	findings: {
		tailwindUtilities: Finding[];
		specific: Finding[];
		hexColors: Finding[];
		functionalColors: Finding[];
		cssVariables: Finding[];
		svgAttrs: Finding[];
	};
	specialItems: SpecialItemsReport;
	summary: {
		totalMatches: number;
		filesTouched: number;
		breakdown: Record<
			keyof Report["findings"],
			{ matches: number; files: number }
		>;
	};
};

function fail(message: string): never {
	console.error(`[report-colors] ${message}`);
	process.exit(1);
}

function hasRg(): boolean {
	const res = spawnSync("rg", ["--version"], { encoding: "utf8" });
	return res.status === 0 && res.stdout.includes("ripgrep");
}

function runRg(
	pattern: string,
	opts: {
		caseInsensitive?: boolean;
		svgOnly?: boolean;
	},
): Finding[] {
	const excludeGlobs = [
		"!**/node_modules/**",
		"!**/.next/**",
		"!**/dist/**",
		"!**/build/**",
		"!**/out/**",
		"!**/coverage/**",
	];

	const includeGlobsAll = [
		"**/*.css",
		"**/*.scss",
		"**/*.ts",
		"**/*.tsx",
		"**/*.js",
		"**/*.jsx",
		"**/*.md",
		"**/*.mdx",
		"**/*.svg",
	];
	const includeGlobsSvg = ["**/*.svg"];

	const args = [
		"-n", // show line numbers
		"--json", // machine-readable
		"--hidden", // include dotfiles if any
	];

	// case-insensitive (default: true)
	if (opts.caseInsensitive !== false) {
		args.push("-i");
	}

	// globs
	const includeGlobs = opts.svgOnly ? includeGlobsSvg : includeGlobsAll;
	for (const g of excludeGlobs) args.push("--glob", g);
	for (const g of includeGlobs) args.push("--glob", g);

	// pattern
	args.push("-e", pattern);

	const res = spawnSync("rg", args, { encoding: "utf8" });
	if (res.status !== 0 && res.status !== 1) {
		// 0: matches found, 1: no matches, others: error
		console.error(res.stdout);
		console.error(res.stderr);
		fail(`ripgrep failed (status ${res.status}) for pattern: ${pattern}`);
	}

	const findings: Finding[] = [];

	for (const line of res.stdout.split("\n")) {
		if (!line.trim()) continue;
		let ev: RgEvent;
		try {
			ev = JSON.parse(line) as RgEvent;
		} catch {
			// ignore non-JSON lines (shouldn't happen with --json)
			continue;
		}
		if (ev.type !== "match") continue;
		const m = (ev as { data: RgMatch }).data;
		const path = m.path.text;
		const lineNum = m.line_number;
		const context = m.lines.text;
		for (const sm of m.submatches) {
			findings.push({
				path,
				line: lineNum,
				match: sm.match.text,
				context,
			});
		}
	}

	return findings;
}

function uniqPaths(items: Finding[]): number {
	return new Set(items.map((f) => f.path)).size;
}

function slicePreview(items: Finding[], n = 10): Finding[] {
	return items.slice(0, n);
}

function buildReport(rootDir: string): Report {
	// Patterns
	const patterns = {
		// Tailwind color utilities with optional scale and opacity suffix:
		// e.g., text-white-900, bg-gray-200/20, border-brand-500, ring-focused
		tailwindUtilities:
			String.raw`\b(?:text|bg|border|ring|outline|divide|from|via|to|fill|stroke)-[a-zA-Z-]+(?:-\d{1,3})?(?:/\d{1,3})?\b`,
		// Specific high-priority items to consolidate
		specific:
			String.raw`\btext-white-900\b|\btext-black-600/20\b|\bcolor-border-focused\b`,
		// Hex colors, 3/4 or 6/8 digits
		hexColors:
			String.raw`#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b`,
		// Functional notations
		functionalColors: String.raw`\b(?:rgba?|hsla?|oklch)\([^)]*\)`,
		// CSS variable definitions
		cssVariables:
			String.raw`--(?:color|brand|text|bg|surface|border|ring|shadow)[-\w]*\s*:`,
		// SVG attributes
		svgAttrs: String.raw`fill=|stroke=`,
	};

	// Run searches
	const tailwindUtilities = runRg(patterns.tailwindUtilities, {});
	const specific = runRg(patterns.specific, {});
	const hexColors = runRg(patterns.hexColors, {});
	const functionalColors = runRg(patterns.functionalColors, {});
	const cssVariables = runRg(patterns.cssVariables, {});
	const svgAttrs = runRg(patterns.svgAttrs, { svgOnly: true });

	// Special items broken out
	const textWhite900 = runRg(String.raw`\btext-white-900\b`, {});
	const textBlack600_20 = runRg(String.raw`\btext-black-600/20\b`, {});
	const colorBorderFocused = runRg(String.raw`\bcolor-border-focused\b`, {});

	// Summary
	const breakdown = {
		tailwindUtilities: {
			matches: tailwindUtilities.length,
			files: uniqPaths(tailwindUtilities),
		},
		specific: {
			matches: specific.length,
			files: uniqPaths(specific),
		},
		hexColors: {
			matches: hexColors.length,
			files: uniqPaths(hexColors),
		},
		functionalColors: {
			matches: functionalColors.length,
			files: uniqPaths(functionalColors),
		},
		cssVariables: {
			matches: cssVariables.length,
			files: uniqPaths(cssVariables),
		},
		svgAttrs: {
			matches: svgAttrs.length,
			files: uniqPaths(svgAttrs),
		},
	};

	const totalMatches =
		breakdown.tailwindUtilities.matches +
		breakdown.specific.matches +
		breakdown.hexColors.matches +
		breakdown.functionalColors.matches +
		breakdown.cssVariables.matches +
		breakdown.svgAttrs.matches;

	const filesTouched = uniqPaths([
		...tailwindUtilities,
		...specific,
		...hexColors,
		...functionalColors,
		...cssVariables,
		...svgAttrs,
	]);

	const report: Report = {
		generatedAt: new Date().toISOString(),
		rootDir,
		options: {
			caseInsensitive: true,
			excludeGlobs: [
				"!**/node_modules/**",
				"!**/.next/**",
				"!**/dist/**",
				"!**/build/**",
				"!**/out/**",
				"!**/coverage/**",
			],
			includeGlobs: [
				"**/*.css",
				"**/*.scss",
				"**/*.ts",
				"**/*.tsx",
				"**/*.js",
				"**/*.jsx",
				"**/*.md",
				"**/*.mdx",
				"**/*.svg",
			],
		},
		patterns: {
			tailwindUtilities: {
				regex: patterns.tailwindUtilities,
				totalMatches: breakdown.tailwindUtilities.matches,
				fileCount: breakdown.tailwindUtilities.files,
				preview: slicePreview(tailwindUtilities),
			},
			specific: {
				regex: patterns.specific,
				totalMatches: breakdown.specific.matches,
				fileCount: breakdown.specific.files,
				preview: slicePreview(specific),
			},
			hexColors: {
				regex: patterns.hexColors,
				totalMatches: breakdown.hexColors.matches,
				fileCount: breakdown.hexColors.files,
				preview: slicePreview(hexColors),
			},
			functionalColors: {
				regex: patterns.functionalColors,
				totalMatches: breakdown.functionalColors.matches,
				fileCount: breakdown.functionalColors.files,
				preview: slicePreview(functionalColors),
			},
			cssVariables: {
				regex: patterns.cssVariables,
				totalMatches: breakdown.cssVariables.matches,
				fileCount: breakdown.cssVariables.files,
				preview: slicePreview(cssVariables),
			},
			svgAttrs: {
				regex: patterns.svgAttrs,
				totalMatches: breakdown.svgAttrs.matches,
				fileCount: breakdown.svgAttrs.files,
				preview: slicePreview(svgAttrs),
			},
		},
		findings: {
			tailwindUtilities,
			specific,
			hexColors,
			functionalColors,
			cssVariables,
			svgAttrs,
		},
		specialItems: {
			textWhite900,
			textBlack600_20,
			colorBorderFocused,
		},
		summary: {
			totalMatches,
			filesTouched,
			breakdown,
		},
	};

	return report;
}

function parseArgs(argv: string[]): { outPath?: string } {
	const outIndex = argv.indexOf("--out");
	if (outIndex !== -1) {
		const val = argv[outIndex + 1];
		if (!val || val.startsWith("-")) {
			fail("Expected a value after --out");
		}
		return { outPath: val };
	}
	return {};
}

(function main() {
	if (!hasRg()) {
		fail(
			"ripgrep (rg) not found on PATH. Please install ripgrep to run this script.",
		);
	}

	const cwd = process.cwd();
	const { outPath } = parseArgs(process.argv.slice(2));
	const report = buildReport(cwd);
	const json = JSON.stringify(report, null, 2);

	if (outPath) {
		const absOut = resolve(cwd, outPath);
		const dir = dirname(absOut);
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}
		writeFileSync(absOut, json, "utf8");
		console.log(`[report-colors] Wrote report to ${absOut}`);
	} else {
		// Print to stdout for ad-hoc inspection
		console.log(json);
	}
})();
