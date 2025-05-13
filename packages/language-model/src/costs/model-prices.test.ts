import { beforeEach, describe, expect, it } from "vitest";
import {
	type ModelPriceTable,
	clearValidPriceCache,
	getValidPricing,
	openAiTokenPricing,
} from "./model-prices";
import type { ModelPrice } from "./pricing";

describe("getValidPricing", () => {
	beforeEach(() => {
		clearValidPriceCache();
	});

	it("should return the price", () => {
		const now = new Date();
		const past = new Date(now.getTime() - 1000);

		const priceTable: ModelPriceTable = {
			"test-model": {
				prices: [
					{
						validFrom: past.toISOString(),
						price: {
							input: { costPerMegaToken: 1 },
							output: { costPerMegaToken: 2 },
						},
					},
				],
			},
		};

		const result = getValidPricing("test-model", priceTable);
		expect(result.price.input.costPerMegaToken).toBe(1);
		expect(result.price.output.costPerMegaToken).toBe(2);
	});
	it("should return the most recent valid price", () => {
		const now = new Date();
		const past = new Date(now.getTime() - 1000);
		const future = new Date(Date.now() + 1000);

		const priceTable: ModelPriceTable = {
			"test-model": {
				prices: [
					{
						validFrom: past.toISOString(),
						price: {
							input: { costPerMegaToken: 1 },
							output: { costPerMegaToken: 2 },
						},
					},
					{
						validFrom: now.toISOString(),
						price: {
							input: { costPerMegaToken: 3 },
							output: { costPerMegaToken: 4 },
						},
					},
					{
						validFrom: future.toISOString(),
						price: {
							input: { costPerMegaToken: 5 },
							output: { costPerMegaToken: 6 },
						},
					},
				],
			},
		};

		const result = getValidPricing("test-model", priceTable);
		expect(result.price.input.costPerMegaToken).toBe(3);
		expect(result.price.output.costPerMegaToken).toBe(4);
	});

	it("should throw an error when model is not found", () => {
		const priceTable: ModelPriceTable = {};

		expect(() => getValidPricing("non-existent-model", priceTable)).toThrow(
			"No pricing found for model non-existent-model",
		);
	});

	it("should throw an error when no valid prices are found", () => {
		const future = new Date(Date.now() + 1000);
		const priceTable: ModelPriceTable = {
			"test-model": {
				prices: [
					{
						validFrom: future.toISOString(),
						price: {
							input: { costPerMegaToken: 1 },
							output: { costPerMegaToken: 2 },
						},
					},
				],
			},
		};

		expect(() => getValidPricing("test-model", priceTable)).toThrow(
			"No valid pricing found for model test-model",
		);
	});

	it("should return the most recent price when multiple valid prices exist", () => {
		const now = new Date();
		const initial = new Date(now.getTime() - 2000);
		const updated = new Date(now.getTime() - 1000);

		const priceTable: ModelPriceTable = {
			"test-model": {
				prices: [
					{
						validFrom: initial.toISOString(),
						price: {
							input: { costPerMegaToken: 1 },
							output: { costPerMegaToken: 2 },
						},
					},
					{
						validFrom: updated.toISOString(),
						price: {
							input: { costPerMegaToken: 3 },
							output: { costPerMegaToken: 4 },
						},
					},
				],
			},
		};

		const result = getValidPricing("test-model", priceTable);
		expect(result.price.input.costPerMegaToken).toBe(3);
		expect(result.price.output.costPerMegaToken).toBe(4);
	});

	it("should return valid pricing for a model", () => {
		const price = getValidPricing("gpt-4.1", openAiTokenPricing);
		expect(price).toBeDefined();
		expect(price.price.input.costPerMegaToken).toBe(2.0);
		expect(price.price.output.costPerMegaToken).toBe(8.0);
	});

	it("should use cache for subsequent calls", () => {
		// First call should calculate and cache
		const firstCall = getValidPricing("gpt-4.1", openAiTokenPricing);
		// Second call should use cache
		const secondCall = getValidPricing("gpt-4.1", openAiTokenPricing);
		expect(firstCall).toBe(secondCall); // Should be the same object reference
	});

	it("should throw error for non-existent model", () => {
		expect(() =>
			getValidPricing("non-existent-model", openAiTokenPricing),
		).toThrow("No pricing found for model non-existent-model");
	});
});
