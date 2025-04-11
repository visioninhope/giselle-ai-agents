import assert from "node:assert";
import { describe, it } from "node:test";
import { migratePathname } from "./migrate-pathname.ts";

describe("migratePathname", () => {
	it("should correctly transform file paths with file IDs", () => {
		// Test case 1: Basic file path transformation
		const originalPath =
			"private-beta/runs/rn-CTKTEVLRummpeucz/files/fl-ZCuyp2uZWzMBd36x/file-name.txt";
		const expectedPath =
			"runs/rn-CTKTEVLRummpeucz/files/fl-ZCuyp2uZWzMBd36x/fl-ZCuyp2uZWzMBd36x";
		assert.strictEqual(migratePathname(originalPath), expectedPath);

		// Test case 2: File path with image file
		const imagePath =
			"private-beta/workspaces/wrks-eql99zdhueBobqc9/files/fl-GoEdPGLDKPKMYHIV/Screenshot 2025-04-03 at 17.21.20.png";
		const expectedImagePath =
			"workspaces/wrks-eql99zdhueBobqc9/files/fl-GoEdPGLDKPKMYHIV/fl-GoEdPGLDKPKMYHIV";
		assert.strictEqual(migratePathname(imagePath), expectedImagePath);

		// Test case 3: File path with markdown file
		const markdownPath =
			"private-beta/workspaces/wrks-fj4UcnnoF3z8r9oP/files/fl-OIKsqju8pNnRhkfI/2025-03-11-sample.md";
		const expectedMarkdownPath =
			"workspaces/wrks-fj4UcnnoF3z8r9oP/files/fl-OIKsqju8pNnRhkfI/fl-OIKsqju8pNnRhkfI";
		assert.strictEqual(migratePathname(markdownPath), expectedMarkdownPath);
	});

	it("should handle paths without file IDs correctly", () => {
		// Test case 4: Path with no file ID
		const noIdPath =
			"private-beta/workspaces/wrks-fj4UcnnoF3z8r9oP/other/document.pdf";
		const expectedNoIdPath =
			"workspaces/wrks-fj4UcnnoF3z8r9oP/other/document.pdf";
		assert.strictEqual(migratePathname(noIdPath), expectedNoIdPath);

		// Test case: Generation JSON file that shouldn't have its filename modified
		const generationPath = "private-beta/generations/gnr-1UzrTpa0t5RRAXu0.json";
		const expectedGenerationPath = "generations/gnr-1UzrTpa0t5RRAXu0.json";
		assert.strictEqual(migratePathname(generationPath), expectedGenerationPath);
	});

	it("should handle edge cases correctly", () => {
		// Test case 5: Empty path
		const emptyPath = "";
		assert.strictEqual(migratePathname(emptyPath), "");

		// Test case 6: Path with only the prefix
		const prefixOnlyPath = "private-beta";
		assert.strictEqual(migratePathname(prefixOnlyPath), "");

		// Test case 7: Path with "files/fl-" but no actual file ID
		const invalidIdPath =
			"private-beta/workspaces/wrks-123/files/fl-/document.pdf";
		const expectedInvalidPath = "workspaces/wrks-123/files/fl-/document.pdf";
		assert.strictEqual(migratePathname(invalidIdPath), expectedInvalidPath);
	});
});
