import { describe, expect, it } from "vitest";
import { blobLikeToUint8Array } from "./blob-like";

describe("blobLikeToUint8Array", () => {
	const testData = new Uint8Array([1, 2, 3, 4, 5]);

	it("should handle Uint8Array input", () => {
		const input = new Uint8Array([1, 2, 3, 4, 5]);
		const result = blobLikeToUint8Array(input);

		expect(result).toBeInstanceOf(Uint8Array);
		expect(result).toEqual(testData);
		// Should create a new instance, not return the same reference
		expect(result).not.toBe(input);
	});

	it("should handle Buffer input", () => {
		const input = Buffer.from([1, 2, 3, 4, 5]);
		const result = blobLikeToUint8Array(input);

		expect(result).toBeInstanceOf(Uint8Array);
		expect(result).toEqual(testData);
	});

	it("should handle ArrayBuffer input", () => {
		const input = new ArrayBuffer(5);
		const view = new Uint8Array(input);
		view.set([1, 2, 3, 4, 5]);

		const result = blobLikeToUint8Array(input);

		expect(result).toBeInstanceOf(Uint8Array);
		expect(result).toEqual(testData);
	});

	it("should handle ArrayBufferView input (Int8Array)", () => {
		const input = new Int8Array([1, 2, 3, 4, 5]);
		const result = blobLikeToUint8Array(input);

		expect(result).toBeInstanceOf(Uint8Array);
		expect(result).toEqual(testData);
	});

	it("should handle ArrayBufferView input (DataView)", () => {
		const buffer = new ArrayBuffer(5);
		const view = new DataView(buffer);
		view.setUint8(0, 1);
		view.setUint8(1, 2);
		view.setUint8(2, 3);
		view.setUint8(3, 4);
		view.setUint8(4, 5);

		const result = blobLikeToUint8Array(view);

		expect(result).toBeInstanceOf(Uint8Array);
		expect(result).toEqual(testData);
	});

	it("should handle ArrayBufferView with offset and length", () => {
		const buffer = new ArrayBuffer(10);
		const fullView = new Uint8Array(buffer);
		fullView.set([0, 0, 1, 2, 3, 4, 5, 0, 0, 0]);

		const slicedView = new Uint8Array(buffer, 2, 5);
		const result = blobLikeToUint8Array(slicedView);

		expect(result).toBeInstanceOf(Uint8Array);
		expect(result).toEqual(testData);
		expect(result.length).toBe(5);
	});

	it("should preserve data integrity", () => {
		const originalData = [255, 128, 64, 32, 16, 8, 4, 2, 1, 0];
		const buffer = Buffer.from(originalData);
		const result = blobLikeToUint8Array(buffer);

		expect(Array.from(result)).toEqual(originalData);
	});
});
