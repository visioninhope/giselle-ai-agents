import { createId } from "@paralleldrive/cuid2";

/**
 * Creates a temporary ID using cuid2 library
 * @returns {number} A negative number to be used as a temporary ID
 */
export const createTemporaryId = (): number => {
	// Generate a unique ID using cuid2
	const id = createId();

	// Extract the first 8 characters of the ID
	// These characters are essentially hexadecimal digits (0-9, a-v in cuid2)
	const hexSubstring = id.slice(0, 8);

	// Convert the hexadecimal substring to a decimal number
	// This gives us a positive integer
	const decimalValue = Number.parseInt(hexSubstring, 16);

	// Make the value negative and return
	// We use Math.abs to ensure the result is always negative, even in the rare case
	// where parseInt returns a negative number (which shouldn't happen with cuid2)
	return -Math.abs(decimalValue);
};
