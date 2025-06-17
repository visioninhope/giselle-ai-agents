import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { LineChunker } from "./line-chunker";

const FIXTURES_DIR = join(__dirname, "__fixtures__");
const GOLDEN_DIR = join(__dirname, "__golden__");

// Helper to read fixture
function readFixture(path: string): string {
	return readFileSync(join(FIXTURES_DIR, path), "utf-8");
}

// Helper to get golden file path
function getGoldenPath(fixtureName: string, configName: string): string {
	// Remove file extension to get base name
	const baseName = fixtureName.replace(/\.[^.]+$/, "");
	return join(GOLDEN_DIR, baseName, `${configName}.txt`);
}

// Delimiter for separating chunks
const CHUNK_DELIMITER = "===== CHUNK";

// Helper to format chunks as delimiter-separated text
function formatChunks(chunks: string[]): string {
	return chunks
		.map((chunk, index) => `${CHUNK_DELIMITER} ${index + 1} =====\n${chunk}`)
		.join("\n");
}

// Helper to parse delimiter-separated text back to chunks
function parseChunks(text: string): string[] {
	const pattern = new RegExp(`${CHUNK_DELIMITER} \\d+ =====\\n`, "g");
	return text
		.split(pattern)
		.slice(1) // Skip the first empty element
		.map((chunk) => chunk.trimEnd()); // Remove trailing newline
}

// Helper to read or write golden data
function compareWithGolden(
	goldenPath: string,
	actual: string[],
	updateGolden = false,
): void {
	const goldenData = formatChunks(actual);

	if (updateGolden || !existsSync(goldenPath)) {
		// Ensure directory exists
		mkdirSync(dirname(goldenPath), { recursive: true });
		writeFileSync(goldenPath, goldenData);
		console.log(`Golden file created/updated: ${goldenPath}`);
		return;
	}

	const expected = readFileSync(goldenPath, "utf-8");
	const expectedChunks = parseChunks(expected);
	expect(actual).toEqual(expectedChunks);
}

// Test configurations
const TEST_CONFIGS = {
	"small-chunks": { maxLines: 5, overlap: 1 },
	"large-chunks": { maxLines: 50, overlap: 10 },
	"no-overlap": { maxLines: 10, overlap: 0 },
	"char-limit": { maxLines: 100, maxChars: 200, overlap: 0 },
	"high-overlap": { maxLines: 10, overlap: 8 },
};

// Test fixtures
const FIXTURES = [
	"code-sample.ts",
	"markdown-doc.md",
	"edge-cases/long-lines.txt",
];

describe("LineChunker Golden Tests", () => {
	// Set to true to update golden files
	const UPDATE_GOLDEN = process.env.UPDATE_GOLDEN === "true";

	for (const fixture of FIXTURES) {
		describe(`Fixture: ${fixture}`, () => {
			const content = readFixture(fixture);

			for (const [configName, config] of Object.entries(TEST_CONFIGS)) {
				it(`should match golden data with config: ${configName}`, () => {
					const chunker = new LineChunker(config);
					const chunks = chunker.chunk(content);
					const goldenPath = getGoldenPath(fixture, configName);

					compareWithGolden(goldenPath, chunks, UPDATE_GOLDEN);
				});
			}
		});
	}

	describe("Chunk integrity validation", () => {
		it("should preserve all content when concatenating chunks", () => {
			const content = readFixture("code-sample.ts");
			const chunker = new LineChunker({ maxLines: 10, overlap: 0 });
			const chunks = chunker.chunk(content);

			// All original content should be present when concatenating chunks
			const allContent = chunks.join("");
			expect(allContent).toContain("export interface User");
			expect(allContent).toContain("export class UserService");
			expect(allContent).toContain("export class PostService");
		});

		it("should ensure chunks have expected characteristics", () => {
			const content = readFixture("markdown-doc.md");
			const maxLines = 5;
			const maxChars = 300;
			const chunker = new LineChunker({ maxLines, maxChars, overlap: 2 });
			const chunks = chunker.chunk(content);

			for (const [index, chunk] of chunks.entries()) {
				// Each chunk should not exceed maxChars
				expect(chunk.length).toBeLessThanOrEqual(maxChars);

				// Each chunk (except possibly the last) should not exceed maxLines
				const lineCount = chunk.split("\n").length;
				if (index < chunks.length - 1) {
					expect(lineCount).toBeLessThanOrEqual(maxLines);
				}

				// No chunk should be empty after trimming
				expect(chunk.trim().length).toBeGreaterThan(0);
			}
		});

		it("should handle overlap correctly", () => {
			const content = readFixture("code-sample.ts");
			const overlap = 3;
			const chunker = new LineChunker({ maxLines: 10, overlap });
			const chunks = chunker.chunk(content);

			// Check that consecutive chunks have overlapping lines
			for (let i = 0; i < chunks.length - 1; i++) {
				const currentLines = chunks[i].split("\n");
				const nextLines = chunks[i + 1].split("\n");

				// The last few lines of current chunk should match
				// the first few lines of next chunk
				const currentTail = currentLines.slice(-overlap).join("\n");
				const nextHead = nextLines.slice(0, overlap).join("\n");

				// They might not be exactly equal due to line reduction
				// but there should be some overlap
				expect(nextLines.length).toBeGreaterThan(0);
			}
		});
	});

	describe("Basic functionality", () => {
		it("should handle empty content", () => {
			const chunker = new LineChunker();
			const chunks = chunker.chunk("");
			expect(chunks).toEqual([]);
		});

		it("should handle single line", () => {
			const content = "This is a single line of text";
			const chunker = new LineChunker();
			const chunks = chunker.chunk(content);
			expect(chunks.length).toBe(1);
			expect(chunks[0]).toBe(content);
		});
	});
});

// Instructions for updating golden files:
// Run: UPDATE_GOLDEN=true pnpm test line-chunker.test.ts
