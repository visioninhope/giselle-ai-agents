import { describe, expect, it, vi } from "vitest";
import { query } from "./query";
import type { QueryFunction } from "./types";

// Mock the OpenAIEmbedder
vi.mock("./embed", () => ({
	OpenAIEmbedder: vi.fn().mockImplementation(() => ({
		embed: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
	})),
}));

describe("query function", () => {
	// biome-ignore lint/suspicious/noExplicitAny: mock
	const mockQueryFunction: QueryFunction<any, any> = vi
		.fn()
		.mockResolvedValue([]);

	it("should throw error for empty string question", async () => {
		await expect(
			query({
				question: "",
				limit: 10,
				filters: {},
				queryFunction: mockQueryFunction,
			}),
		).rejects.toThrow("Question cannot be empty or only whitespace");
	});

	it("should throw error for whitespace-only question", async () => {
		await expect(
			query({
				question: "   \t\n  ",
				limit: 10,
				filters: {},
				queryFunction: mockQueryFunction,
			}),
		).rejects.toThrow("Question cannot be empty or only whitespace");
	});

	it("should throw error for negative limit", async () => {
		await expect(
			query({
				question: "test question",
				limit: -1,
				filters: {},
				queryFunction: mockQueryFunction,
			}),
		).rejects.toThrow("Limit must be greater than 0");
	});

	it("should throw error for zero limit", async () => {
		await expect(
			query({
				question: "test question",
				limit: 0,
				filters: {},
				queryFunction: mockQueryFunction,
			}),
		).rejects.toThrow("Limit must be greater than 0");
	});

	it("should throw error for invalid similarity threshold", async () => {
		await expect(
			query({
				question: "test question",
				limit: 10,
				filters: {},
				similarityThreshold: -0.1,
				queryFunction: mockQueryFunction,
			}),
		).rejects.toThrow("Similarity threshold must be between 0 and 1");

		await expect(
			query({
				question: "test question",
				limit: 10,
				filters: {},
				similarityThreshold: 1.1,
				queryFunction: mockQueryFunction,
			}),
		).rejects.toThrow("Similarity threshold must be between 0 and 1");
	});

	it("should handle query function errors", async () => {
		const errorQueryFunction = vi
			.fn()
			.mockRejectedValue(new Error("Query function failed"));

		await expect(
			query({
				question: "test question",
				limit: 10,
				filters: {},
				queryFunction: errorQueryFunction,
			}),
		).rejects.toThrow("Query execution failed: Query function failed");
	});

	it("should trim whitespace from question", async () => {
		const mockEmbedder = {
			embed: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
		};

		// Import the module directly to access the mocked implementation
		const { OpenAIEmbedder } = await import("./embed");
		// biome-ignore lint/suspicious/noExplicitAny: mock
		(OpenAIEmbedder as any).mockImplementation(() => mockEmbedder);

		await query({
			question: "  test question  ",
			limit: 10,
			filters: {},
			queryFunction: mockQueryFunction,
		});

		expect(mockEmbedder.embed).toHaveBeenCalledWith("test question");
	});

	it("should succeed with valid parameters", async () => {
		const result = await query({
			question: "test question",
			limit: 10,
			filters: { test: "filter" },
			similarityThreshold: 0.7,
			queryFunction: mockQueryFunction,
		});

		expect(result).toEqual([]);
		expect(mockQueryFunction).toHaveBeenCalledWith({
			embedding: [0.1, 0.2, 0.3],
			limit: 10,
			filters: { test: "filter" },
			similarityThreshold: 0.7,
		});
	});
});
