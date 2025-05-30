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
		this.maxLines = maxLines;
		this.overlap = overlap;
		this.maxChars = maxChars;
	}

	/**
	 * Split document string into chunks by lines with character limit enforcement
	 * @param content - document string to be chunked
	 */
	async *chunk(content: string): AsyncGenerator<ChunkResult, void, unknown> {
		const lines = content.split(/\r?\n/);
		const processedLines = this.splitLongLines(lines);
		const hasLongLines = this.hasLongLinesAfterProcessing(processedLines);

		let chunkIndex = 0;

		if (hasLongLines) {
			// For content with very long lines, yield each processed segment as individual chunks
			// Note: Overlap is not applied when dealing with long lines to ensure all content is preserved
			for (const line of processedLines) {
				yield this.createChunk(line, chunkIndex++);
			}
		} else {
			// Normal line-based chunking with overlap for regular content
			yield* this.createLineBasedChunks(processedLines, chunkIndex);
		}
	}

	/**
	 * Split lines that exceed the character limit into smaller segments
	 */
	private splitLongLines(lines: string[]): string[] {
		const processedLines: string[] = [];

		for (const line of lines) {
			if (line.length > this.maxChars) {
				// Split long line into maxChars-sized segments
				for (let i = 0; i < line.length; i += this.maxChars) {
					processedLines.push(line.substring(i, i + this.maxChars));
				}
			} else {
				processedLines.push(line);
			}
		}

		return processedLines;
	}

	/**
	 * Check if the processed lines contain segments that are still very long
	 */
	private hasLongLinesAfterProcessing(processedLines: string[]): boolean {
		return processedLines.some((line) => line.length >= this.maxChars * 0.8);
	}

	/**
	 * Create line-based chunks with overlap for normal content
	 */
	private async *createLineBasedChunks(
		processedLines: string[],
		startIndex: number,
	): AsyncGenerator<ChunkResult, void, unknown> {
		let chunkIndex = startIndex;
		const step = Math.max(1, this.maxLines - this.overlap);

		for (let i = 0; i < processedLines.length; i += step) {
			const chunkLines = processedLines.slice(i, i + this.maxLines);
			let chunkContent = chunkLines.join("\n");

			// Enforce character limit even for line-based chunks
			if (chunkContent.length > this.maxChars) {
				chunkContent = chunkContent.substring(0, this.maxChars);
			}

			yield this.createChunk(chunkContent, chunkIndex++);
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
): Chunker {
	return new LineChunker(maxLines, overlap, maxChars);
}
