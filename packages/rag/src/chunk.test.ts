import { describe, expect, it } from "vitest";
import { LineChunker } from "./chunk";

describe("LineChunker", () => {
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

			// 20,000 characters should be split into 2 chunks: 10,000 + 10,000
			expect(chunks).toHaveLength(2);
			expect(chunks[0].content.length).toBe(10000);
			expect(chunks[1].content.length).toBe(10000);

			// Each chunk should be under the character limit
			for (const chunk of chunks) {
				expect(chunk.content.length).toBeLessThanOrEqual(10000);
			}
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

			// 25,000 characters should be split into 3 chunks: 10,000 + 10,000 + 5,000
			expect(chunks).toHaveLength(3);
			expect(chunks[0].content.length).toBe(10000);
			expect(chunks[1].content.length).toBe(10000);
			expect(chunks[2].content.length).toBe(5000);

			// Verify total content length is preserved exactly
			const totalContentLength = chunks.reduce(
				(sum, chunk) => sum + chunk.content.length,
				0,
			);
			expect(totalContentLength).toBe(originalContent.length);
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

			// Should create 4 chunks:
			// 1. "line1" (normal short line)
			// 2. First 10,000 chars of longLine
			// 3. Remaining 10,000 chars of longLine
			// 4. "line3" (normal short line)
			expect(chunks).toHaveLength(4);

			// Check that all chunks respect character limit
			for (const chunk of chunks) {
				expect(chunk.content.length).toBeLessThanOrEqual(10000);
			}

			// Verify specific chunk contents
			expect(chunks[0].content).toBe("line1");
			expect(chunks[1].content).toBe("x".repeat(10000));
			expect(chunks[2].content).toBe("x".repeat(10000));
			expect(chunks[3].content).toBe("line3");
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

			// Should create exactly 2 chunks: 10000 + 1
			expect(chunks).toHaveLength(2);
			expect(chunks[0].content.length).toBe(10000);
			expect(chunks[1].content.length).toBe(1);
		});
	});
});
