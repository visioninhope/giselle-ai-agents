import { z } from "zod/v4";
import { ConfigurationError } from "../errors";
import type { Chunker } from "./types";

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

export interface LineChunkerOptions {
	/**
	 * Maximum number of lines per chunk
	 * Default: 150
	 */
	maxLines?: number;
	/**
	 * Number of lines to overlap between chunks
	 * Default: 30
	 */
	overlap?: number;
	/**
	 * Maximum characters per chunk before splitting
	 * Default: 10000
	 */
	maxChars?: number;
}

interface ChunkInfo {
	startIndex: number;
	endIndex: number;
	content: string;
	currentOverlap: number;
	lines: string[];
}

export class LineChunker implements Chunker {
	private maxLines: number;
	private overlap: number;
	private maxChars: number;

	constructor(options: LineChunkerOptions = {}) {
		// Validate configuration with Zod
		const validationResult = LineChunkerOptionsSchema.safeParse(options);
		if (!validationResult.success) {
			throw ConfigurationError.invalidValue(
				"LineChunkerOptions",
				options,
				"Valid chunker configuration",
				{
					operation: "constructor",
					validationErrors: validationResult.error.issues,
				},
			);
		}

		// Use validated and defaulted values
		const validatedOptions = validationResult.data;
		this.maxLines = validatedOptions.maxLines;
		this.overlap = validatedOptions.overlap;
		this.maxChars = validatedOptions.maxChars;
	}

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
	chunk(text: string): string[] {
		const lines = text.split("\n");
		const chunks: string[] = [];

		let i = 0;
		let wasLineSplit = false;

		while (i < lines.length) {
			const isFirstChunk = chunks.length === 0;
			const shouldOverlap = this.shouldUseOverlap(isFirstChunk, wasLineSplit);
			const initialOverlap = shouldOverlap ? this.overlap : 0;

			// Create initial chunk
			let chunkInfo = this.createInitialChunk(i, lines, initialOverlap);

			// Reset wasLineSplit for each chunk
			wasLineSplit = false;

			// Phase 1: Gradual overlap reduction
			while (
				chunkInfo.content.length > this.maxChars &&
				chunkInfo.currentOverlap > 0
			) {
				const reduced = this.reduceOverlapGradually(chunkInfo, lines);
				if (reduced === null) break;
				chunkInfo = reduced;
			}

			// Phase 2: Gradual line reduction
			while (chunkInfo.content.length > this.maxChars) {
				const reduced = this.reduceLineCountGradually(chunkInfo, lines);
				if (reduced === null) break;
				chunkInfo = reduced;
			}

			// Phase 3: Character splitting (last resort)
			if (chunkInfo.content.length > this.maxChars) {
				const splitChunks = this.splitLongContent(chunkInfo.content);
				chunks.push(...splitChunks);
				wasLineSplit = true;
				i = chunkInfo.endIndex;
			} else {
				// Normal chunk processing
				if (chunkInfo.content.length > 0) {
					chunks.push(chunkInfo.content);
				}
				i = this.calculateNextPosition(chunkInfo, wasLineSplit);
			}

			// Prevent infinite loop
			if (i >= lines.length || chunkInfo.endIndex >= lines.length) {
				break;
			}
		}

		return chunks.filter((chunk) => chunk.trim().length > 0);
	}

	/**
	 * Determine if overlap should be used for the current chunk
	 */
	private shouldUseOverlap(
		isFirstChunk: boolean,
		wasLineSplit: boolean,
	): boolean {
		return !isFirstChunk && !wasLineSplit;
	}

	/**
	 * Calculate next starting position based on chunk info and line split status
	 */
	private calculateNextPosition(
		chunkInfo: ChunkInfo,
		wasLineSplit: boolean,
	): number {
		const actualChunkSize = chunkInfo.endIndex - chunkInfo.startIndex;
		const effectiveOverlap = wasLineSplit ? 0 : this.overlap;
		const nextPosition =
			chunkInfo.startIndex + actualChunkSize - effectiveOverlap;

		// Ensure progress by advancing at least 1 position
		return Math.max(nextPosition, chunkInfo.startIndex + 1);
	}

	/**
	 * Create initial chunk information
	 */
	private createInitialChunk(
		startIndex: number,
		lines: string[],
		initialOverlap: number,
	): ChunkInfo {
		const endIndex = Math.min(startIndex + this.maxLines, lines.length);
		const chunkLines = lines.slice(startIndex, endIndex);
		const content = chunkLines.join("\n").trim();

		return {
			startIndex,
			endIndex,
			content,
			currentOverlap: initialOverlap,
			lines: chunkLines,
		};
	}

	/**
	 * Reduce overlap gradually and adjust chunk accordingly
	 * Returns null if overlap cannot be reduced further (already 0)
	 */
	private reduceOverlapGradually(
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

		// Create new chunk with adjusted boundaries
		const newChunkLines = lines.slice(newStartIndex, newEndIndex);
		const newContent = newChunkLines.join("\n").trim();

		return {
			startIndex: newStartIndex,
			endIndex: newEndIndex,
			content: newContent,
			currentOverlap: newOverlap,
			lines: newChunkLines,
		};
	}

	/**
	 * Reduce line count gradually when overlap reduction is not sufficient
	 * Returns null if only one line remains (cannot reduce further)
	 */
	private reduceLineCountGradually(
		chunkInfo: ChunkInfo,
		lines: string[],
	): ChunkInfo | null {
		const currentLineCount = chunkInfo.endIndex - chunkInfo.startIndex;

		if (currentLineCount <= 1) {
			return null;
		}

		// Reduce by one line from the end
		const newEndIndex = chunkInfo.endIndex - 1;

		// Create new chunk with reduced line count
		const newChunkLines = lines.slice(chunkInfo.startIndex, newEndIndex);
		const newContent = newChunkLines.join("\n").trim();

		return {
			startIndex: chunkInfo.startIndex,
			endIndex: newEndIndex,
			content: newContent,
			currentOverlap: chunkInfo.currentOverlap,
			lines: newChunkLines,
		};
	}

	/**
	 * Split long content into smaller chunks
	 * This is only used for single lines that exceed maxChars
	 */
	private splitLongContent(content: string): string[] {
		const chunks: string[] = [];
		for (let i = 0; i < content.length; i += this.maxChars) {
			const chunk = content.substring(
				i,
				Math.min(i + this.maxChars, content.length),
			);
			if (chunk.trim().length > 0) {
				chunks.push(chunk.trim());
			}
		}
		return chunks;
	}
}
