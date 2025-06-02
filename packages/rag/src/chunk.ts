import type { ChunkResult, Chunker } from "./types";

/**
 * Default maximum lines per chunk
 */
const DEFAULT_MAX_LINES = 150;

/**
 * Default number of overlapping lines between chunks
 */
const DEFAULT_OVERLAP = 30;

/**
 * Default maximum characters per chunk, based on embedding API token limits:
 * - Embedding APIs typically support up to 8,192 tokens
 * - Using 10,000 characters provides a safety margin for token conversion
 * - Ensures chunks stay within API limits while maximizing content per chunk
 */
const DEFAULT_MAX_CHARS = 10000;

/**
 * LineChunker splits content into chunks based on line count with character limits.
 * Handles both normal line-based chunking and special processing for very long lines.
 */
export class LineChunker implements Chunker {
	private maxLines: number;
	private overlap: number;
	private maxChars: number;

	constructor(maxLines: number, overlap: number, maxChars: number) {
		if (maxLines < 0) {
			throw new Error(
				`Invalid value for maxLines: ${maxLines}. Must be non-negative.`,
			);
		}
		if (overlap < 0) {
			throw new Error(
				`Invalid value for overlap: ${overlap}. Must be non-negative.`,
			);
		}
		if (maxChars < 0) {
			throw new Error(
				`Invalid value for maxChars: ${maxChars}. Must be non-negative.`,
			);
		}
		if (overlap >= maxLines) {
			throw new Error(
				`Invalid configuration: overlap (${overlap}) must be less than maxLines (${maxLines}).`,
			);
		}

		this.maxLines = maxLines;
		this.overlap = overlap;
		this.maxChars = maxChars;
	}

	/**
	 * Split document string into chunks by lines with character limit enforcement
	 * @param content - document string to be chunked
	 */
	*chunk(content: string) {
		const lines = content.split(/\r?\n/);

		let chunkIndex = 0;
		let i = 0;

		while (i < lines.length) {
			// 1. Take maxLines worth of lines
			const chunkLines = lines.slice(i, i + this.maxLines);

			// 2. Join lines with overlap
			let chunkContent = chunkLines.join("\n");
			let currentOverlap = this.overlap;

			// 3. If exceeds limit, gradually reduce overlap
			while (chunkContent.length > this.maxChars && currentOverlap > 0) {
				currentOverlap = Math.floor(currentOverlap / 2);
				const step = this.maxLines - currentOverlap;
				const reducedOverlapLines = lines.slice(i, i + step);
				chunkContent = reducedOverlapLines.join("\n");
			}

			// 4. If still exceeds after removing all overlap, split by character count
			if (chunkContent.length > this.maxChars) {
				yield* this.splitIntoMultipleChunks(chunkContent, chunkIndex);
				chunkIndex += Math.ceil(chunkContent.length / this.maxChars);
				i += this.maxLines - currentOverlap;
			} else {
				yield this.createChunk(chunkContent, chunkIndex++);
				i += this.maxLines - currentOverlap;
			}
		}
	}

	/**
	 * Split content into multiple chunks when it exceeds character limit
	 */
	private *splitIntoMultipleChunks(content: string, startIndex: number) {
		let index = startIndex;
		for (let i = 0; i < content.length; i += this.maxChars) {
			const chunk = content.substring(i, i + this.maxChars);
			yield this.createChunk(chunk, index++);
		}
	}

	/**
	 * Create a chunk result object
	 */
	private createChunk(content: string, index: number): ChunkResult {
		return {
			content,
			index,
		};
	}
}

/**
 * Helper function to create a LineChunker with default settings
 * @param maxLines - Maximum lines per chunk (default: 150)
 * @param overlap - Number of overlapping lines between chunks (default: 30)
 * @param maxChars - Maximum characters per chunk, based on embedding API limits (default: 10000)
 */
export function createLineChunker(
	maxLines = DEFAULT_MAX_LINES,
	overlap = DEFAULT_OVERLAP,
	maxChars = DEFAULT_MAX_CHARS,
) {
	return new LineChunker(maxLines, overlap, maxChars);
}
