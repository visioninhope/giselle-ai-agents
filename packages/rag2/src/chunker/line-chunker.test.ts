import { describe, expect, it } from "vitest";
import { LineChunker } from "./line-chunker";

describe("LineChunker", () => {
	it("should split text into chunks based on line count", () => {
		const chunker = new LineChunker({
			maxLines: 3,
			overlap: 0, // No overlap to simplify testing
		});
		const text = "line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8";

		const chunks = chunker.chunk(text);

		// Should create multiple chunks based on line count
		expect(chunks.length).toBeGreaterThan(1);
		// Check that each chunk is not empty
		for (const chunk of chunks) {
			expect(chunk.trim().length).toBeGreaterThan(0);
		}

		// Each chunk should have at most 3 lines (except possibly the last)
		for (let i = 0; i < chunks.length - 1; i++) {
			const lineCount = chunks[i].split("\n").length;
			expect(lineCount).toBeLessThanOrEqual(3);
		}
	});

	it("should handle empty text", () => {
		const chunker = new LineChunker();
		const chunks = chunker.chunk("");

		expect(chunks).toEqual([]);
	});

	it("should handle single line text", () => {
		const chunker = new LineChunker();
		const text = "This is a single line of text";

		const chunks = chunker.chunk(text);

		expect(chunks).toEqual([text]);
	});

	it("should apply overlap when configured", () => {
		const chunker = new LineChunker({
			maxLines: 3,
			overlap: 1,
		});
		const text = "line1\nline2\nline3\nline4\nline5\nline6";

		const chunks = chunker.chunk(text);

		expect(chunks.length).toBeGreaterThan(1);
		// check that there is overlap between chunks
		const hasOverlap = chunks.some((chunk, index) => {
			if (index === 0) return false;
			const prevChunk = chunks[index - 1];
			return chunk.split("\n").some((line) => prevChunk.includes(line));
		});
		expect(hasOverlap).toBe(true);
	});

	it("should split chunks when they exceed maxChars", () => {
		const chunker = new LineChunker({
			maxLines: 10,
			overlap: 2,
			maxChars: 50,
		});
		// Create a chunk that would normally be within maxLines but exceeds maxChars
		const longText =
			"This is a very long line that definitely exceeds the maximum character limit set for chunks and should be split into multiple parts";
		const text = `${longText}\nshort line\nanother line`;

		const chunks = chunker.chunk(text);

		// Should create multiple chunks due to character limit
		expect(chunks.length).toBeGreaterThan(1);

		// Check that no chunk exceeds maxChars
		for (const chunk of chunks) {
			expect(chunk.length).toBeLessThanOrEqual(50); // maxChars limit
		}

		// Check that the content is preserved
		const reconstructed = chunks.join("\n");
		expect(reconstructed).toContain("This is a very long");
		expect(reconstructed).toContain("short line");
		expect(reconstructed).toContain("another line");
	});

	it("should use default maxChars when not specified", () => {
		const chunker = new LineChunker();
		const veryLongText = "a".repeat(15000); // Longer than default maxChars (10000)

		const chunks = chunker.chunk(veryLongText);

		// Should split the very long text
		expect(chunks.length).toBeGreaterThan(1);

		// No chunk should exceed default maxChars significantly
		for (const chunk of chunks) {
			expect(chunk.length).toBeLessThanOrEqual(10000);
		}
	});

	it("should prioritize line count for chunking", () => {
		const chunker = new LineChunker({
			maxLines: 2,
			overlap: 0,
			maxChars: 1000, // Set high to ensure line count is the primary factor
		});
		const text = "line1\nline2\nline3\nline4\nline5";

		const chunks = chunker.chunk(text);

		// Should create chunks based on line count first
		expect(chunks.length).toBeGreaterThan(1);

		// Each chunk should respect the line limit
		for (const chunk of chunks) {
			const lineCount = chunk.split("\n").length;
			expect(lineCount).toBeLessThanOrEqual(2);
		}
	});

	describe("Gradual Overlap Reduction", () => {
		it("should gradually reduce overlap when content exceeds maxChars", () => {
			// Create content that will require overlap reduction
			// Each line is about 100 characters
			const longLine = "x".repeat(100);
			const lines = Array.from({ length: 150 }, () => longLine);
			const testText = lines.join("\n"); // ~15,000 characters total

			const chunker = new LineChunker({
				maxLines: 150,
				overlap: 30,
				maxChars: 10000,
			});

			const chunks = chunker.chunk(testText);

			// Should create multiple chunks due to character limit
			expect(chunks.length).toBeGreaterThan(1);

			// Each chunk should respect maxChars
			for (const chunk of chunks) {
				expect(chunk.length).toBeLessThanOrEqual(10000);
			}

			// Verify all original lines are present (may have duplicates due to overlap)
			const originalLines = testText
				.split("\n")
				.filter((line) => line.trim().length > 0);
			const allChunkContent = chunks.join("");

			// Check that total content length is preserved
			const expectedLength = originalLines.join("").length;
			const actualLength = allChunkContent.replace(/\s/g, "").length;

			// Should be close to original (allowing for some processing differences)
			expect(actualLength).toBeGreaterThanOrEqual(expectedLength * 0.95);
		});

		it("should preserve maximum possible overlap", () => {
			// Create content where overlap can be partially preserved
			const lines = Array.from(
				{ length: 200 },
				(_, i) => `Line ${i + 1}: Content that makes each line reasonably long`,
			);
			const testText = lines.join("\n");

			const chunker = new LineChunker({
				maxLines: 100,
				overlap: 20,
				maxChars: 5000,
			});

			const chunks = chunker.chunk(testText);

			// Check that there are overlapping lines between consecutive chunks
			for (let i = 1; i < chunks.length; i++) {
				const prevChunkLines = chunks[i - 1].split("\n");
				const currentChunkLines = chunks[i].split("\n");

				// Find overlapping content
				let overlapCount = 0;
				for (const line of currentChunkLines) {
					if (prevChunkLines.includes(line) && line.trim() !== "") {
						overlapCount++;
					}
				}

				// Should have some overlap (may be reduced from original 20)
				expect(overlapCount).toBeGreaterThan(0);
			}
		});

		it("should reduce lines when overlap reduction is not enough", () => {
			// Create very long lines that require line count reduction
			const veryLongLine = "x".repeat(5000); // Half of maxChars
			const lines = Array.from({ length: 10 }, () => veryLongLine);
			const testText = lines.join("\n"); // 50,000 characters total

			const chunker = new LineChunker({
				maxLines: 10,
				overlap: 2,
				maxChars: 10000,
			});

			const chunks = chunker.chunk(testText);

			// Should create multiple chunks
			expect(chunks.length).toBeGreaterThan(1);

			// Each chunk should have fewer than maxLines due to character constraint
			for (const chunk of chunks) {
				expect(chunk.length).toBeLessThanOrEqual(10000);
				const lineCount = chunk.split("\n").length;
				expect(lineCount).toBeLessThan(10); // Less than maxLines
			}
		});
	});

	describe("OpenAI Document Scenario", () => {
		it("should handle table-heavy content with proper overlap", () => {
			// Simulate OpenAI document structure
			const tableRow =
				"| model-name    | ✅            | ✅              | ❌         | ✅ (High)    | 200k tokens    | 100k tokens       | $1.10 / $4.40                        | Pro          |";

			const openaiSimulated = [
				"---",
				"title: OpenAI",
				"description: 'Overview of available OpenAI Models'",
				"---",
				"",
				"## Quick Comparison",
				"",
				"| Models         | Generate Text | Input Image     | Web Search | Reasoning    | Context Window | Max Output Tokens | Pricing (Input/Output per 1M tokens) | Availability |",
				"|----------------|---------------|-----------------|------------|--------------|----------------|-------------------|--------------------------------------|--------------|",
				...Array.from({ length: 140 }, () => tableRow),
				"",
				"## Additional Content",
				"",
				...Array.from(
					{ length: 50 },
					(_, i) => `Additional line ${i + 1} with some content`,
				),
			];

			const testText = openaiSimulated.join("\n");

			const chunker = new LineChunker({
				maxLines: 150,
				overlap: 30,
				maxChars: 10000,
			});

			const chunks = chunker.chunk(testText);

			// Should create at least 2 chunks
			expect(chunks.length).toBeGreaterThanOrEqual(2);

			// Check for overlap between chunks
			if (chunks.length >= 2) {
				const chunk1Lines = chunks[0].split("\n");
				const chunk2Lines = chunks[1].split("\n");

				// Find overlapping lines
				let overlapCount = 0;
				for (const line of chunk2Lines) {
					if (chunk1Lines.includes(line) && line.trim() !== "") {
						overlapCount++;
					}
				}

				// Should maintain some overlap
				expect(overlapCount).toBeGreaterThan(0);
			}

			// Verify no content is lost
			const allLines = testText
				.split("\n")
				.filter((line) => line.trim() !== "");
			const chunkLines = chunks
				.join("\n")
				.split("\n")
				.filter((line) => line.trim() !== "");

			// Check that all unique content is preserved
			const originalSet = new Set(allLines);
			const chunkSet = new Set(chunkLines);

			for (const line of originalSet) {
				expect(chunkSet.has(line)).toBe(true);
			}
		});

		it("should handle single extremely long line", () => {
			const veryLongLine = "a".repeat(25000); // Much longer than maxChars

			const chunker = new LineChunker({
				maxLines: 150,
				overlap: 30,
				maxChars: 10000,
			});

			const chunks = chunker.chunk(veryLongLine);

			// Should split into at least 3 chunks
			expect(chunks.length).toBeGreaterThanOrEqual(3);

			// Each chunk should respect maxChars
			for (const chunk of chunks) {
				expect(chunk.length).toBeLessThanOrEqual(10000);
			}

			// Total content should be preserved
			const totalContent = chunks.join("");
			expect(totalContent.length).toBe(veryLongLine.length);
		});
	});

	describe("Helper Functions", () => {
		describe("shouldUseOverlap", () => {
			it("should return false for first chunk", () => {
				const chunker = new LineChunker();
				// @ts-expect-error - accessing private method for testing
				expect(chunker.shouldUseOverlap(true, false)).toBe(false);
			});

			it("should return false after line split", () => {
				const chunker = new LineChunker();
				// @ts-expect-error - accessing private method for testing
				expect(chunker.shouldUseOverlap(false, true)).toBe(false);
			});

			it("should return true for normal chunks", () => {
				const chunker = new LineChunker();
				// @ts-expect-error - accessing private method for testing
				expect(chunker.shouldUseOverlap(false, false)).toBe(true);
			});

			it("should return false for first chunk even after line split", () => {
				const chunker = new LineChunker();
				// @ts-expect-error - accessing private method for testing
				expect(chunker.shouldUseOverlap(true, true)).toBe(false);
			});
		});

		describe("nextStartIndex", () => {
			const chunker = new LineChunker({ overlap: 4 });

			it("should calculate next position for normal chunk", () => {
				const chunkInfo = {
					startIndex: 6,
					endIndex: 16,
					content: "test content",
					currentOverlap: 2, // this doesn't affect calculation
					lines: [],
				};

				// @ts-expect-error - accessing private method for testing
				const nextPos = chunker.nextStartIndex(chunkInfo, false);
				// nextPos = start + chunkSize - effectiveOverlap = 6 + 10 - 4 = 12
				expect(nextPos).toBe(12);
			});

			it("should calculate next position after line split", () => {
				const chunkInfo = {
					startIndex: 20,
					endIndex: 21,
					content: "split content",
					currentOverlap: 0,
					lines: [],
				};

				// @ts-expect-error - accessing private method for testing
				const nextPos = chunker.nextStartIndex(chunkInfo, true);
				// nextPos = start + chunkSize - 0 = 20 + 1 - 0 = 21
				expect(nextPos).toBe(21);
			});

			it("should calculate next position for first chunk", () => {
				const chunkInfo = {
					startIndex: 0,
					endIndex: 10,
					content: "first chunk",
					currentOverlap: 0,
					lines: [],
				};

				// @ts-expect-error - accessing private method for testing
				const nextPos = chunker.nextStartIndex(chunkInfo, false);
				// nextPos = start + chunkSize - effectiveOverlap = 0 + 10 - 4 = 6
				expect(nextPos).toBe(6);
			});

			it("should calculate next position for reduced chunk", () => {
				const chunkInfo = {
					startIndex: 8,
					endIndex: 15,
					content: "reduced chunk",
					currentOverlap: 1, // reduced overlap, but doesn't affect calculation
					lines: [],
				};

				// @ts-expect-error - accessing private method for testing
				const nextPos = chunker.nextStartIndex(chunkInfo, false);
				// nextPos = start + chunkSize - effectiveOverlap = 8 + 7 - 4 = 11
				expect(nextPos).toBe(11);
			});

			it("should ensure minimum progress to prevent infinite loop", () => {
				const chunkInfo = {
					startIndex: 10,
					endIndex: 12, // only 2 lines
					content: "small chunk",
					currentOverlap: 0,
					lines: [],
				};

				const chunkerWithLargeOverlap = new LineChunker({ overlap: 5 }); // overlap > actualChunkSize

				// @ts-expect-error - accessing private method for testing
				const nextPos = chunkerWithLargeOverlap.nextStartIndex(
					chunkInfo,
					false,
				);
				// Without protection: 10 + 2 - 5 = 7 (backward!)
				// With protection: Math.max(7, 10 + 1) = 11 (forward progress)
				expect(nextPos).toBe(11);
				expect(nextPos).toBeGreaterThan(chunkInfo.startIndex);
			});
		});

		describe("createInitialChunk", () => {
			const chunker = new LineChunker({ maxLines: 5, overlap: 2 });
			const testLines = [
				"line0",
				"line1",
				"line2",
				"line3",
				"line4",
				"line5",
				"line6",
				"line7",
			];

			it("should create chunk from start of lines", () => {
				// @ts-expect-error - accessing private method for testing
				const chunkInfo = chunker.createInitialChunk(0, testLines, 0);

				expect(chunkInfo.startIndex).toBe(0);
				expect(chunkInfo.endIndex).toBe(5);
				expect(chunkInfo.content).toBe("line0\nline1\nline2\nline3\nline4");
				expect(chunkInfo.currentOverlap).toBe(0);
				expect(chunkInfo.lines).toEqual([
					"line0",
					"line1",
					"line2",
					"line3",
					"line4",
				]);
			});

			it("should create chunk from middle of lines", () => {
				// @ts-expect-error - accessing private method for testing
				const chunkInfo = chunker.createInitialChunk(3, testLines, 2);

				expect(chunkInfo.startIndex).toBe(3);
				expect(chunkInfo.endIndex).toBe(8);
				expect(chunkInfo.content).toBe("line3\nline4\nline5\nline6\nline7");
				expect(chunkInfo.currentOverlap).toBe(2);
				expect(chunkInfo.lines).toEqual([
					"line3",
					"line4",
					"line5",
					"line6",
					"line7",
				]);
			});

			it("should handle end of lines boundary", () => {
				// @ts-expect-error - accessing private method for testing
				const chunkInfo = chunker.createInitialChunk(6, testLines, 1);

				expect(chunkInfo.startIndex).toBe(6);
				expect(chunkInfo.endIndex).toBe(8); // limited by lines.length
				expect(chunkInfo.content).toBe("line6\nline7");
				expect(chunkInfo.currentOverlap).toBe(1);
				expect(chunkInfo.lines).toEqual(["line6", "line7"]);
			});

			it("should handle empty content properly", () => {
				const emptyLines = ["", "", ""];
				// @ts-expect-error - accessing private method for testing
				const chunkInfo = chunker.createInitialChunk(0, emptyLines, 0);

				expect(chunkInfo.startIndex).toBe(0);
				expect(chunkInfo.endIndex).toBe(3);
				expect(chunkInfo.content).toBe(""); // trim() removes all whitespace from empty lines
				expect(chunkInfo.currentOverlap).toBe(0);
			});
		});

		describe("reduceOverlapGradually", () => {
			const chunker = new LineChunker({ maxLines: 10, overlap: 4 });
			const testLines = [
				"line0",
				"line1",
				"line2",
				"line3",
				"line4",
				"line5",
				"line6",
				"line7",
				"line8",
				"line9",
			];

			it("should reduce overlap by half and adjust start position", () => {
				const chunkInfo = {
					startIndex: 0,
					endIndex: 8,
					content: "line0\nline1\nline2\nline3\nline4\nline5\nline6\nline7",
					currentOverlap: 4,
					lines: testLines.slice(0, 8),
				};

				// @ts-expect-error - accessing private method for testing
				const reduced = chunker.reduceOverlapGradually(chunkInfo, testLines);

				expect(reduced).not.toBeNull();
				if (reduced === null) throw new Error("reduced should not be null");

				expect(reduced.currentOverlap).toBe(2); // 4 / 2 = 2
				expect(reduced.startIndex).toBe(2); // 0 + (4 - 2) = 2
				expect(reduced.endIndex).toBe(8); // end position stays fixed
				expect(reduced.content).toBe(
					"line2\nline3\nline4\nline5\nline6\nline7",
				);
				expect(reduced.lines).toEqual([
					"line2",
					"line3",
					"line4",
					"line5",
					"line6",
					"line7",
				]);
			});

			it("should reduce odd overlap correctly", () => {
				const chunkInfo = {
					startIndex: 1,
					endIndex: 6,
					content: "line1\nline2\nline3\nline4\nline5",
					currentOverlap: 3,
					lines: testLines.slice(1, 6),
				};

				// @ts-expect-error - accessing private method for testing
				const reduced = chunker.reduceOverlapGradually(chunkInfo, testLines);

				expect(reduced).not.toBeNull();
				if (reduced === null) throw new Error("reduced should not be null");

				expect(reduced.currentOverlap).toBe(1); // floor(3 / 2) = 1
				expect(reduced.startIndex).toBe(3); // 1 + (3 - 1) = 3
				expect(reduced.endIndex).toBe(6); // end position stays fixed
				expect(reduced.content).toBe("line3\nline4\nline5");
				expect(reduced.lines).toEqual(["line3", "line4", "line5"]);
			});

			it("should return null when overlap is already 0", () => {
				const chunkInfo = {
					startIndex: 2,
					endIndex: 7,
					content: "line2\nline3\nline4\nline5\nline6",
					currentOverlap: 0,
					lines: testLines.slice(2, 7),
				};

				// @ts-expect-error - accessing private method for testing
				const reduced = chunker.reduceOverlapGradually(chunkInfo, testLines);

				expect(reduced).toBeNull();
			});

			it("should handle overlap of 1 correctly", () => {
				const chunkInfo = {
					startIndex: 0,
					endIndex: 5,
					content: "line0\nline1\nline2\nline3\nline4",
					currentOverlap: 1,
					lines: testLines.slice(0, 5),
				};

				// @ts-expect-error - accessing private method for testing
				const reduced = chunker.reduceOverlapGradually(chunkInfo, testLines);

				expect(reduced).not.toBeNull();
				if (reduced === null) throw new Error("reduced should not be null");

				expect(reduced.currentOverlap).toBe(0); // floor(1 / 2) = 0
				expect(reduced.startIndex).toBe(1); // 0 + (1 - 0) = 1
				expect(reduced.endIndex).toBe(5); // end position stays fixed
				expect(reduced.content).toBe("line1\nline2\nline3\nline4");
				expect(reduced.lines).toEqual(["line1", "line2", "line3", "line4"]);
			});

			it("should handle large overlap reduction", () => {
				const chunkInfo = {
					startIndex: 0,
					endIndex: 10,
					content: testLines.join("\n"),
					currentOverlap: 8,
					lines: testLines,
				};

				// @ts-expect-error - accessing private method for testing
				const reduced = chunker.reduceOverlapGradually(chunkInfo, testLines);

				expect(reduced).not.toBeNull();
				if (reduced === null) throw new Error("reduced should not be null");

				expect(reduced.currentOverlap).toBe(4); // floor(8 / 2) = 4
				expect(reduced.startIndex).toBe(4); // 0 + (8 - 4) = 4
				expect(reduced.endIndex).toBe(10); // end position stays fixed
				expect(reduced.content).toBe(
					"line4\nline5\nline6\nline7\nline8\nline9",
				);
				expect(reduced.lines).toEqual([
					"line4",
					"line5",
					"line6",
					"line7",
					"line8",
					"line9",
				]);
			});

			it("should handle edge case where start equals end after reduction", () => {
				const chunkInfo = {
					startIndex: 9,
					endIndex: 10,
					content: "line9",
					currentOverlap: 2,
					lines: ["line9"],
				};

				// @ts-expect-error - accessing private method for testing
				const reduced = chunker.reduceOverlapGradually(chunkInfo, testLines);

				expect(reduced).not.toBeNull();
				if (reduced === null) throw new Error("reduced should not be null");

				expect(reduced.currentOverlap).toBe(1); // floor(2 / 2) = 1
				expect(reduced.startIndex).toBe(10); // 9 + (2 - 1) = 10
				expect(reduced.endIndex).toBe(10); // end position stays fixed
				expect(reduced.content).toBe(""); // empty content when start equals end
				expect(reduced.lines).toEqual([]); // empty lines array
			});
		});

		describe("reduceLineCountGradually", () => {
			const chunker = new LineChunker({ maxLines: 10, overlap: 4 });
			const testLines = [
				"line0",
				"line1",
				"line2",
				"line3",
				"line4",
				"line5",
				"line6",
				"line7",
				"line8",
				"line9",
			];

			it("should reduce line count by one from the end", () => {
				const chunkInfo = {
					startIndex: 2,
					endIndex: 7,
					content: "line2\nline3\nline4\nline5\nline6",
					currentOverlap: 3,
					lines: testLines.slice(2, 7),
				};

				// @ts-expect-error - accessing private method for testing
				const reduced = chunker.reduceLineCountGradually(chunkInfo, testLines);

				expect(reduced).not.toBeNull();
				if (reduced === null) throw new Error("reduced should not be null");

				expect(reduced.startIndex).toBe(2); // start position stays fixed
				expect(reduced.endIndex).toBe(6); // end reduced by 1
				expect(reduced.content).toBe("line2\nline3\nline4\nline5");
				expect(reduced.currentOverlap).toBe(3); // overlap unchanged
				expect(reduced.lines).toEqual(["line2", "line3", "line4", "line5"]);
			});

			it("should handle multiple line reductions", () => {
				const chunkInfo = {
					startIndex: 0,
					endIndex: 5,
					content: "line0\nline1\nline2\nline3\nline4",
					currentOverlap: 2,
					lines: testLines.slice(0, 5),
				};

				// @ts-expect-error - accessing private method for testing
				let reduced = chunker.reduceLineCountGradually(chunkInfo, testLines);

				expect(reduced).not.toBeNull();
				if (reduced === null) throw new Error("reduced should not be null");

				expect(reduced.endIndex).toBe(4);
				expect(reduced.content).toBe("line0\nline1\nline2\nline3");

				// Reduce again
				// @ts-expect-error - accessing private method for testing
				reduced = chunker.reduceLineCountGradually(reduced, testLines);

				expect(reduced).not.toBeNull();
				if (reduced === null) throw new Error("reduced should not be null");

				expect(reduced.endIndex).toBe(3);
				expect(reduced.content).toBe("line0\nline1\nline2");
			});

			it("should return null when only one line remains", () => {
				const chunkInfo = {
					startIndex: 4,
					endIndex: 5,
					content: "line4",
					currentOverlap: 1,
					lines: ["line4"],
				};

				// @ts-expect-error - accessing private method for testing
				const reduced = chunker.reduceLineCountGradually(chunkInfo, testLines);

				expect(reduced).toBeNull();
			});

			it("should handle two-line chunk correctly", () => {
				const chunkInfo = {
					startIndex: 3,
					endIndex: 5,
					content: "line3\nline4",
					currentOverlap: 0,
					lines: ["line3", "line4"],
				};

				// @ts-expect-error - accessing private method for testing
				const reduced = chunker.reduceLineCountGradually(chunkInfo, testLines);

				expect(reduced).not.toBeNull();
				if (reduced === null) throw new Error("reduced should not be null");

				expect(reduced.startIndex).toBe(3);
				expect(reduced.endIndex).toBe(4);
				expect(reduced.content).toBe("line3");
				expect(reduced.currentOverlap).toBe(0);
				expect(reduced.lines).toEqual(["line3"]);
			});

			it("should preserve start position and overlap", () => {
				const chunkInfo = {
					startIndex: 1,
					endIndex: 8,
					content: "line1\nline2\nline3\nline4\nline5\nline6\nline7",
					currentOverlap: 4,
					lines: testLines.slice(1, 8),
				};

				// @ts-expect-error - accessing private method for testing
				const reduced = chunker.reduceLineCountGradually(chunkInfo, testLines);

				expect(reduced).not.toBeNull();
				if (reduced === null) throw new Error("reduced should not be null");

				expect(reduced.startIndex).toBe(1); // unchanged
				expect(reduced.endIndex).toBe(7); // reduced by 1
				expect(reduced.currentOverlap).toBe(4); // unchanged
				expect(reduced.content).toBe(
					"line1\nline2\nline3\nline4\nline5\nline6",
				);
				expect(reduced.lines).toEqual([
					"line1",
					"line2",
					"line3",
					"line4",
					"line5",
					"line6",
				]);
			});

			it("should handle edge case where start equals end after reduction", () => {
				const chunkInfo = {
					startIndex: 9,
					endIndex: 10,
					content: "line9",
					currentOverlap: 1,
					lines: ["line9"],
				};

				// @ts-expect-error - accessing private method for testing
				const reduced = chunker.reduceLineCountGradually(chunkInfo, testLines);

				expect(reduced).toBeNull(); // Cannot reduce further
			});
		});
	});

	describe("Edge Cases", () => {
		it("should handle content exactly at maxChars limit", () => {
			const exactContent = "x".repeat(10000);

			const chunker = new LineChunker({
				maxLines: 150,
				overlap: 30,
				maxChars: 10000,
			});

			const chunks = chunker.chunk(exactContent);

			expect(chunks.length).toBe(1);
			expect(chunks[0].length).toBe(10000);
		});

		it("should handle overlap larger than available lines", () => {
			const shortContent =
				"line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10\nline11\nline12";

			const chunker = new LineChunker({
				maxLines: 5,
				overlap: 3,
				maxChars: 10000,
			});

			const chunks = chunker.chunk(shortContent);

			// Should create multiple chunks with overlap
			expect(chunks.length).toBeGreaterThan(1);

			// Check overlaps exist
			for (let i = 1; i < chunks.length; i++) {
				const prevLines = chunks[i - 1].split("\n");
				const currLines = chunks[i].split("\n");

				let overlap = 0;
				for (const line of currLines) {
					if (prevLines.includes(line)) overlap++;
				}

				// Should have some overlap
				expect(overlap).toBeGreaterThan(0);
			}
		});

		it("should maintain overlap with varying line lengths", () => {
			const lines = [
				"short",
				"a".repeat(100),
				"medium length line",
				"x".repeat(200),
				"another short",
				...Array.from({ length: 50 }, (_, i) => `Regular line ${i + 1}`),
			];
			const testText = lines.join("\n");

			const chunker = new LineChunker({
				maxLines: 20,
				overlap: 5,
				maxChars: 2000,
			});

			const chunks = chunker.chunk(testText);

			// Should create multiple chunks
			expect(chunks.length).toBeGreaterThan(1);

			// Each chunk should respect limits
			for (const chunk of chunks) {
				expect(chunk.length).toBeLessThanOrEqual(2000);
				const lineCount = chunk.split("\n").length;
				expect(lineCount).toBeLessThanOrEqual(20);
			}
		});

		it("should not cause infinite loop with large overlap", () => {
			const chunker = new LineChunker({
				maxLines: 3,
				overlap: 2, // Large overlap relative to maxLines
				maxChars: 50,
			});
			const text =
				"line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10";

			// This should complete without hanging
			const chunks = chunker.chunk(text);

			// Should create chunks and not hang
			expect(chunks.length).toBeGreaterThan(1);
			expect(chunks.length).toBeLessThan(20); // Reasonable upper bound
		});

		it("should not cause infinite loop with problematic edge case", () => {
			const chunker = new LineChunker({
				maxLines: 1,
				overlap: 0,
				maxChars: 10,
			});
			// Single long line that needs character splitting
			const text = "a".repeat(100);

			// This should complete without hanging
			const chunks = chunker.chunk(text);

			// Should create multiple chunks from character splitting
			expect(chunks.length).toBeGreaterThan(1);
			expect(chunks.length).toBeLessThan(50); // Reasonable upper bound
		});

		it("should not cause infinite loop when overlap is very large", () => {
			const chunker = new LineChunker({
				maxLines: 5,
				overlap: 4, // overlap close to maxLines - potentially dangerous
				maxChars: 100,
			});
			const text =
				"short1\nshort2\nshort3\nshort4\nshort5\nshort6\nshort7\nshort8\nshort9\nshort10";

			// This could potentially cause i to not advance properly
			const chunks = chunker.chunk(text);

			// Should complete and create reasonable chunks
			expect(chunks.length).toBeGreaterThan(0);
			expect(chunks.length).toBeLessThan(20); // Reasonable upper bound
		});
	});
});
