import { z } from "zod/v4";
import { ConfigurationError } from "../errors";
import type { ChunkerFunction } from "./types";

const LineChunkerOptionsSchema = z
	.object({
		/**
		 * Maximum number of lines per chunk
		 * Default: 150
		 */
		maxLines: z
			.number()
			.int()
			.positive("maxLines must be positive")
			.max(1000, "maxLines cannot exceed 1000")
			.optional()
			.default(150),
		/**
		 * Number of lines to overlap between chunks
		 * Default: 30
		 */
		overlap: z
			.number()
			.int()
			.nonnegative("overlap must be non-negative")
			.optional()
			.default(30),
		/**
		 * Maximum characters per chunk before splitting
		 * Default: 10000
		 */
		maxChars: z
			.number()
			.int()
			.positive("maxChars must be positive")
			.max(100000, "maxChars cannot exceed 100000")
			.optional()
			.default(10000),
	})
	.refine((data) => data.overlap < data.maxLines, {
		message: "overlap must be less than maxLines",
		path: ["overlap"],
	});
export type LineChunkerOptions = z.input<typeof LineChunkerOptionsSchema>;

enum ShrinkMode {
	OVERLAP_REDUCTION = "overlap_reduction",
	LINE_REDUCTION = "line_reduction",
	CHARACTER_SPLIT = "character_split",
}

interface ChunkInfo {
	startIndex: number;
	endIndex: number;
	content: string;
	currentOverlap: number;
	lines: string[];
}

/**
 * Create a line chunker function with the specified options
 * @param options Configuration options for the chunker
 * @returns A function that chunks text based on lines
 */
export function createLineChunker(
	options: LineChunkerOptions = {},
): ChunkerFunction {
	// Validate configuration with Zod
	const validationResult = LineChunkerOptionsSchema.safeParse(options);
	if (!validationResult.success) {
		throw ConfigurationError.invalidValue(
			"LineChunkerOptions",
			options,
			"Valid chunker configuration",
			{
				operation: "createLineChunker",
				validationErrors: validationResult.error.issues,
			},
		);
	}

	// Use validated and defaulted values
	const { maxLines, overlap, maxChars } = validationResult.data;

	/**
	 * Split text into chunks based on lines with gradual overlap reduction strategy
	 *
	 * Flow:
	 * 1. Start: i = 0, wasLineSplit = false
	 * 2. While i < lines.length:
	 *    a. Create chunk: currentOverlap = (isFirstChunk || wasLineSplit) ? 0 : overlapSetting
	 *    b. Reset wasLineSplit = false
	 *    c. Check if content exceeds maxChars:
	 *       - If No: Confirm chunk
	 *       - If Yes: Check if currentOverlap > 0:
	 *         - If Yes: Gradual overlap reduction (overlap = floor(overlap/2), adjust start position)
	 *         - If No: Check if lineCount > 1:
	 *           - If Yes: Gradual line reduction (end = end - 1)
	 *           - If No: Character split execution, set wasLineSplit = true, i = end
	 *    d. Add chunk and calculate next position: i = start + actualChunkSize - effectiveOverlap
	 * 3. Return chunks (filter empty)
	 */
	return function chunk(text: string): string[] {
		const lines = text.split("\n");
		const chunks: string[] = [];

		let i = 0;
		let wasLineSplit = false;

		while (i < lines.length) {
			const isFirstChunk = chunks.length === 0;
			const shouldOverlap = shouldUseOverlap(isFirstChunk, wasLineSplit);
			const initialOverlap = shouldOverlap ? overlap : 0;

			// Create initial chunk
			let chunkInfo = createInitialChunk(i, lines, initialOverlap, maxLines);

			// Reset wasLineSplit for each chunk
			wasLineSplit = false;

			// Shrinking loop: reduce chunk size until it fits maxChars
			let characterSplit = false;
			while (chunkInfo.content.length > maxChars) {
				const shrinkMode = getShrinkMode(chunkInfo);
				let reduced: ChunkInfo | null = null;

				switch (shrinkMode) {
					case ShrinkMode.OVERLAP_REDUCTION:
						reduced = reduceOverlapGradually(chunkInfo, lines);
						break;
					case ShrinkMode.LINE_REDUCTION:
						reduced = reduceLineCountGradually(chunkInfo, lines);
						break;
					case ShrinkMode.CHARACTER_SPLIT: {
						const splitChunks = splitLongContent(chunkInfo.content, maxChars);
						chunks.push(...splitChunks);
						wasLineSplit = true;
						i = chunkInfo.endIndex;
						characterSplit = true;
						break;
					}
				}

				if (reduced === null || characterSplit) {
					break;
				}
				chunkInfo = reduced;
			}

			// Only process normal chunk if we didn't do character splitting
			if (!characterSplit) {
				if (chunkInfo.content.length > 0) {
					chunks.push(chunkInfo.content);
				}
				i = nextStartIndex(chunkInfo, wasLineSplit, lines.length, overlap);
			}
		}

		return chunks.filter((chunk) => chunk.trim().length > 0);
	};
}

/**
 * Determine the appropriate shrink mode for a chunk that exceeds maxChars
 */
function getShrinkMode(chunkInfo: ChunkInfo): ShrinkMode {
	if (chunkInfo.currentOverlap > 0) {
		return ShrinkMode.OVERLAP_REDUCTION;
	}
	const currentLineCount = chunkInfo.endIndex - chunkInfo.startIndex;
	if (currentLineCount > 1) {
		return ShrinkMode.LINE_REDUCTION;
	}
	return ShrinkMode.CHARACTER_SPLIT;
}

/**
 * Determine if overlap should be used for the current chunk
 */
function shouldUseOverlap(
	isFirstChunk: boolean,
	wasLineSplit: boolean,
): boolean {
	return !isFirstChunk && !wasLineSplit;
}

/**
 * Calculate next starting position based on chunk info and line split status
 */
function nextStartIndex(
	chunkInfo: ChunkInfo,
	wasLineSplit: boolean,
	totalLines: number,
	overlap: number,
): number {
	const actualChunkSize = chunkInfo.endIndex - chunkInfo.startIndex;
	const effectiveOverlap = wasLineSplit ? 0 : overlap;
	const nextPosition =
		chunkInfo.startIndex + actualChunkSize - effectiveOverlap;

	// If we've processed all lines, return the end index to terminate the loop
	if (chunkInfo.endIndex >= totalLines) {
		return chunkInfo.endIndex;
	}

	// Ensure progress by advancing at least 1 position
	return Math.max(nextPosition, chunkInfo.startIndex + 1);
}

/**
 * Build chunk information from boundary indices
 */
function buildChunk(
	startIndex: number,
	endIndex: number,
	lines: string[],
	currentOverlap: number,
): ChunkInfo {
	const chunkLines = lines.slice(startIndex, endIndex);
	const content = chunkLines.join("\n").trim();

	return {
		startIndex,
		endIndex,
		content,
		currentOverlap,
		lines: chunkLines,
	};
}

/**
 * Create initial chunk information
 */
function createInitialChunk(
	startIndex: number,
	lines: string[],
	initialOverlap: number,
	maxLines: number,
): ChunkInfo {
	const endIndex = Math.min(startIndex + maxLines, lines.length);
	return buildChunk(startIndex, endIndex, lines, initialOverlap);
}

/**
 * Reduce overlap gradually and adjust chunk accordingly
 * Returns null if overlap cannot be reduced further (already 0)
 */
function reduceOverlapGradually(
	chunkInfo: ChunkInfo,
	lines: string[],
): ChunkInfo | null {
	if (chunkInfo.currentOverlap === 0) {
		return null;
	}

	// Reduce overlap by half (rounded down)
	const newOverlap = Math.floor(chunkInfo.currentOverlap / 2);

	// Calculate how many lines we're reducing the overlap by
	const overlapReduction = chunkInfo.currentOverlap - newOverlap;

	// Adjust start position forward by the overlap reduction
	const newStartIndex = chunkInfo.startIndex + overlapReduction;

	// Keep the same end position to maintain fixed end boundary
	const newEndIndex = chunkInfo.endIndex;

	return buildChunk(newStartIndex, newEndIndex, lines, newOverlap);
}

/**
 * Reduce line count gradually when overlap reduction is not sufficient
 * Returns null if only one line remains (cannot reduce further)
 */
function reduceLineCountGradually(
	chunkInfo: ChunkInfo,
	lines: string[],
): ChunkInfo | null {
	const currentLineCount = chunkInfo.endIndex - chunkInfo.startIndex;

	if (currentLineCount <= 1) {
		return null;
	}

	// Reduce by one line from the end
	const newEndIndex = chunkInfo.endIndex - 1;

	return buildChunk(
		chunkInfo.startIndex,
		newEndIndex,
		lines,
		chunkInfo.currentOverlap,
	);
}

/**
 * Split long content into smaller chunks
 * This is only used for single lines that exceed maxChars
 */
function splitLongContent(content: string, maxChars: number): string[] {
	return Array.from({ length: Math.ceil(content.length / maxChars) }, (_, k) =>
		content.slice(k * maxChars, (k + 1) * maxChars).trim(),
	).filter(Boolean);
}
