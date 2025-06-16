import { describe, expect, it } from "vitest";
import { PR_1118_DIFF } from "./__fixtures__";
import { type FileDiff, compressLargeDiff } from "./diff-compression";

describe("diff compression", () => {
	it("should return original diff when under maxSize", () => {
		const smallDiff = "diff --git a/test.txt b/test.txt\n+hello world";
		const result = compressLargeDiff(smallDiff, 1000);
		expect(result).toBe(smallDiff);
	});

	it("should compress PR #1118 diff to 1500 characters", () => {
		const compressed = compressLargeDiff(PR_1118_DIFF, 1500);

		expect(compressed.length).toBeLessThanOrEqual(1500);
		expect(compressed).toContain("diff --git");
		expect(compressed).toContain("ingest-github-repository.ts");
		expect(compressed).toContain("route.ts");
	});

	it("should preserve file headers in compressed output", () => {
		const compressed = compressLargeDiff(PR_1118_DIFF, 1500);

		expect(compressed).toContain(
			"diff --git a/apps/studio.giselles.ai/app/api/vector-stores/github/ingest/ingest-github-repository.ts",
		);
		expect(compressed).toContain("new file mode 100644");
		expect(compressed).toContain("index 000000000..b5ad8bde7");
		expect(compressed).toContain("--- /dev/null");
		expect(compressed).toContain(
			"+++ b/apps/studio.giselles.ai/app/api/vector-stores/github/ingest/ingest-github-repository.ts",
		);
	});

	it("should add truncation indicator when content is cut", () => {
		const compressed = compressLargeDiff(PR_1118_DIFF, 1500);

		expect(compressed).toContain("...");
	});

	it("should handle empty diff", () => {
		const result = compressLargeDiff("", 1000);
		expect(result).toBe("");
	});

	it("should handle single file diff", () => {
		const singleFileDiff = `diff --git a/test.txt b/test.txt
index 1234567..abcdefg 100644
--- a/test.txt
+++ b/test.txt
@@ -1,3 +1,3 @@
 line 1
-line 2
+line 2 modified
 line 3`;

		const compressed = compressLargeDiff(singleFileDiff, 150);
		expect(compressed.length).toBeLessThanOrEqual(150);
		expect(compressed).toContain("diff --git");
		expect(compressed).toContain("test.txt");
	});

	it("should show actual compression ratio for PR #1118", () => {
		const originalSize = PR_1118_DIFF.length;
		const compressed = compressLargeDiff(PR_1118_DIFF, 1500);
		const compressedSize = compressed.length;
		const compressionRatio = (
			((originalSize - compressedSize) / originalSize) *
			100
		).toFixed(1);

		console.log(`Original size: ${originalSize} characters`);
		console.log(`Compressed size: ${compressedSize} characters`);
		console.log(`Compression ratio: ${compressionRatio}%`);
		console.log("First 200 chars of compressed output:");
		console.log(`${compressed.substring(0, 200)}...`);

		expect(compressedSize).toBeLessThanOrEqual(1500);
		expect(originalSize).toBeGreaterThan(compressedSize);
	});

	it("should match snapshot for PR #1118 at 1500 chars", () => {
		const compressed = compressLargeDiff(PR_1118_DIFF, 1500);
		expect(compressed).toMatchSnapshot("pr-1118-compressed-1500.txt");
	});

	it("should match snapshot for PR #1118 at 2000 chars", () => {
		const compressed = compressLargeDiff(PR_1118_DIFF, 2000);
		expect(compressed).toMatchSnapshot("pr-1118-compressed-2000.txt");
	});

	it("should match snapshot for PR #1118 at 1000 chars", () => {
		const compressed = compressLargeDiff(PR_1118_DIFF, 1000);
		expect(compressed).toMatchSnapshot("pr-1118-compressed-1000.txt");
	});
});
