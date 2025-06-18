export type { ChunkerFunction } from "./types";
export { createLineChunker, type LineChunkerOptions } from "./line-chunker";
import { createLineChunker } from "./line-chunker";

/**
 * Default configuration values for line chunker
 */
const DEFAULT_CHUNKER_CONFIG = {
	maxLines: 150,
	overlap: 30,
	maxChars: 10000,
} as const;

/**
 * Create a line chunker with default configuration
 * @returns A chunker function with sensible defaults
 */
export function createDefaultChunker() {
	return createLineChunker(DEFAULT_CHUNKER_CONFIG);
}
