import { z } from "zod/v4";
import { ConfigurationError } from "../errors";
import type { ChunkerFunction } from "./types";

const LineChunkerOptionsSchema = z
	.object({
		maxLines: z.number().min(1),
		overlap: z.number().min(0),
		maxChars: z.number().min(1),
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
	options: Partial<LineChunkerOptions> = {},
): ChunkerFunction {
	// Apply defaults
	const optionsWithDefaults = {
		maxLines: 100,
		overlap: 0,
		maxChars: 10000,
		...options,
	};

	const validationResult =
		LineChunkerOptionsSchema.safeParse(optionsWithDefaults);
	if (!validationResult.success) {
		throw ConfigurationError.invalidValue(
			"LineChunkerOptions",
			optionsWithDefaults,
			"Valid chunker configuration",
			{
				operation: "createLineChunker",
				validationErrors: validationResult.error.issues,
			},
		);
	}

	const { maxLines, overlap, maxChars } = validationResult.data;

	/**
	 * Split text into chunks based on lines with overlap
	 */
	return function chunk(text: string): string[] {
		const lines = text.split("\n");
		const chunks: string[] = [];

		let i = 0;
		let skipNextOverlap = false;

		while (i < lines.length) {
			const isFirstChunk = chunks.length === 0;
			const shouldOverlap = shouldUseOverlap(isFirstChunk, skipNextOverlap);
			skipNextOverlap = false;
			const initialOverlap = shouldOverlap ? overlap : 0;

			let chunkInfo = createInitialChunk(i, lines, initialOverlap, maxLines);

			// Shrink loop: reduce chunk size until it fits maxChars
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
						skipNextOverlap = true;
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

			// If we have done character splitting, adding the chunks is already done
			// and we can skip the overlap calculation
			if (!characterSplit) {
				if (chunkInfo.content.length > 0) {
					chunks.push(chunkInfo.content);
				}
				i = nextStartIndex(chunkInfo, skipNextOverlap, lines.length, overlap);
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
	skipNextOverlap: boolean,
): boolean {
	return !isFirstChunk && !skipNextOverlap;
}

/**
 * Calculate next starting position for chunking
 */
function nextStartIndex(
	chunkInfo: ChunkInfo,
	skipNextOverlap: boolean,
	totalLines: number,
	overlap: number,
): number {
	if (chunkInfo.endIndex >= totalLines) {
		return chunkInfo.endIndex;
	}

	const overlapAmount = skipNextOverlap ? 0 : overlap;
	const nextStart = chunkInfo.endIndex - overlapAmount;

	return Math.max(nextStart, chunkInfo.startIndex + 1);
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
	const newOverlap = Math.floor(chunkInfo.currentOverlap / 2);
	const overlapReduction = chunkInfo.currentOverlap - newOverlap;
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
