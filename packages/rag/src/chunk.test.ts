import { describe, expect, it } from "vitest";
import { LineChunker } from "./chunk";

describe("LineChunker", () => {
	describe("constructor validation", () => {
		it("should throw error when maxLines is negative", () => {
			expect(() => new LineChunker(-1, 0, 10000)).toThrow(
				"Invalid value for maxLines: -1. Must be non-negative.",
			);
		});

		it("should throw error when overlap is negative", () => {
			expect(() => new LineChunker(10, -1, 10000)).toThrow(
				"Invalid value for overlap: -1. Must be non-negative.",
			);
		});

		it("should throw error when maxChars is negative", () => {
			expect(() => new LineChunker(10, 0, -1)).toThrow(
				"Invalid value for maxChars: -1. Must be non-negative.",
			);
		});

		it("should throw error when overlap is greater than or equal to maxLines", () => {
			expect(() => new LineChunker(3, 3, 10000)).toThrow(
				"Invalid configuration: overlap (3) must be less than maxLines (3).",
			);
			expect(() => new LineChunker(3, 5, 10000)).toThrow(
				"Invalid configuration: overlap (5) must be less than maxLines (3).",
			);
		});
	});

	describe("normal line-based chunking", () => {
		it("should split content into chunks based on line count", async () => {
			const chunker = new LineChunker(3, 1, 10000);
			const content = "line1\nline2\nline3\nline4\nline5";

			const chunks = [];
			for await (const chunk of chunker.chunk(content)) {
				chunks.push(chunk);
			}

			expect(chunks).toHaveLength(3);
			expect(chunks[0]).toEqual({
				content: "line1\nline2\nline3",
				index: 0,
			});
			expect(chunks[1]).toEqual({
				content: "line3\nline4\nline5",
				index: 1,
			});
			expect(chunks[2]).toEqual({
				content: "line5",
				index: 2,
			});
		});

		it("should handle content with fewer lines than maxLines", async () => {
			const chunker = new LineChunker(5, 1, 10000);
			const content = "line1\nline2";

			const chunks = [];
			for await (const chunk of chunker.chunk(content)) {
				chunks.push(chunk);
			}

			expect(chunks).toHaveLength(1);
			expect(chunks[0]).toEqual({
				content: "line1\nline2",
				index: 0,
			});
		});
	});

	describe("long single line handling", () => {
		it("should split very long single line into multiple chunks", async () => {
			const chunker = new LineChunker(150, 30, 10000);
			// Create a single line with 20,000 characters (over 10,000 limit)
			const longLine = "a".repeat(20000);

			const chunks = [];
			for await (const chunk of chunker.chunk(longLine)) {
				chunks.push(chunk);
			}

			// 20,000 characters should be split into chunks of maxChars size
			expect(chunks.length).toBeGreaterThanOrEqual(2);

			// Each chunk should be under or equal to the character limit
			for (const chunk of chunks) {
				expect(chunk.content.length).toBeLessThanOrEqual(10000);
			}

			// Verify total content is preserved (allowing for processing differences)
			const totalContent = chunks.map((chunk) => chunk.content).join("");
			expect(totalContent.replace(/\n/g, "")).toBe(longLine);
		});

		it("should handle single line under character limit", async () => {
			const chunker = new LineChunker(150, 30, 10000);
			const shortLine = "a".repeat(5000); // Under 10,000 limit

			const chunks = [];
			for await (const chunk of chunker.chunk(shortLine)) {
				chunks.push(chunk);
			}

			expect(chunks).toHaveLength(1);
			expect(chunks[0]).toEqual({
				content: shortLine,
				index: 0,
			});
		});

		it("should preserve content when splitting long lines", async () => {
			const chunker = new LineChunker(150, 30, 10000);
			const originalContent = "a".repeat(25000);

			const chunks = [];
			for await (const chunk of chunker.chunk(originalContent)) {
				chunks.push(chunk);
			}

			// Content should be split into multiple chunks
			expect(chunks.length).toBeGreaterThanOrEqual(3);

			// Each chunk should be under or equal to the character limit
			for (const chunk of chunks) {
				expect(chunk.content.length).toBeLessThanOrEqual(10000);
			}

			// Verify total content is preserved (allowing for processing differences)
			const totalContent = chunks.map((chunk) => chunk.content).join("");
			expect(totalContent.replace(/\n/g, "")).toBe(originalContent);
		});
	});

	describe("mixed content", () => {
		it("should handle content with both normal lines and long lines", async () => {
			const chunker = new LineChunker(3, 1, 10000);
			const longLine = "x".repeat(20000);
			const content = `line1\n${longLine}\nline3`;

			const chunks = [];
			for await (const chunk of chunker.chunk(content)) {
				chunks.push(chunk);
			}

			// Should create multiple chunks handling both normal and long lines
			expect(chunks.length).toBeGreaterThanOrEqual(3);

			// Check that all chunks respect character limit
			for (const chunk of chunks) {
				expect(chunk.content.length).toBeLessThanOrEqual(10000);
			}

			// Verify total content is preserved
			const totalContent = chunks.map((chunk) => chunk.content).join("");
			const originalContentNoNewlines = content.replace(/\n/g, "");
			const totalContentNoNewlines = totalContent.replace(/\n/g, "");
			expect(totalContentNoNewlines).toBe(originalContentNoNewlines);
		});
	});

	describe("edge cases", () => {
		it("should handle empty content", async () => {
			const chunker = new LineChunker(3, 1, 10000);
			const content = "";

			const chunks = [];
			for await (const chunk of chunker.chunk(content)) {
				chunks.push(chunk);
			}

			expect(chunks).toHaveLength(1);
			expect(chunks[0]).toEqual({
				content: "",
				index: 0,
			});
		});

		it("should handle content with only newlines", async () => {
			const chunker = new LineChunker(2, 0, 10000);
			const content = "\n\n\n";

			const chunks = [];
			for await (const chunk of chunker.chunk(content)) {
				chunks.push(chunk);
			}

			// 4 lines (empty strings) with maxLines=2, overlap=0 should create 2 chunks
			expect(chunks).toHaveLength(2);
			expect(chunks[0].content).toBe("\n");
			expect(chunks[1].content).toBe("\n");
		});

		it("should handle exact maxChars boundary", async () => {
			const chunker = new LineChunker(150, 30, 10000);
			const exactLine = "a".repeat(10000); // Exactly maxChars

			const chunks = [];
			for await (const chunk of chunker.chunk(exactLine)) {
				chunks.push(chunk);
			}

			// Should create exactly 1 chunk since it's exactly at the limit
			expect(chunks).toHaveLength(1);
			expect(chunks[0].content.length).toBe(10000);
		});

		it("should handle maxChars + 1 boundary", async () => {
			const chunker = new LineChunker(150, 30, 10000);
			const overLine = "a".repeat(10001); // 1 char over maxChars

			const chunks = [];
			for await (const chunk of chunker.chunk(overLine)) {
				chunks.push(chunk);
			}

			// Should create exactly 2 chunks
			expect(chunks).toHaveLength(2);
			expect(chunks[0].content.length).toBe(10000);
			// Second chunk length may vary due to processing
			expect(chunks[1].content.length).toBeGreaterThan(0);
			expect(chunks[1].content.length).toBeLessThanOrEqual(10000);

			// Verify total content is preserved
			const totalContent = chunks.map((chunk) => chunk.content).join("");
			expect(totalContent.replace(/\n/g, "")).toBe(overLine);
		});
	});
});
