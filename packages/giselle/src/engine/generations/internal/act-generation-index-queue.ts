import { NodeGenerationIndex } from "../../../concepts/generation";
import type { ActId, GenerationId } from "../../../concepts/identifiers";
import { actGenerationIndexesPath } from "../../../concepts/path";
import type { GiselleStorage } from "../../experimental_storage";
import {
	applyPatches,
	type GenerationIndexPatch,
	upsert,
} from "./generation-index-patches";
import { getActGenerationIndexes } from "./get-act-generation-indexes";

interface QueuedPatch {
	actId: ActId;
	patches: GenerationIndexPatch[];
	timestamp: number;
	retryCount: number;
}

interface QueueState {
	queue: Map<ActId, QueuedPatch>;
	processing: Set<ActId>;
	intervalId: NodeJS.Timeout | null;
	retryConfig: RetryConfig;
}

const BATCH_INTERVAL_MS = 50; // Process batches every 50ms
const DEFAULT_MAX_RETRIES = 3; // Maximum number of retry attempts

interface RetryConfig {
	maxRetries: number;
}

// Global state for the patch queue
const state: QueueState = {
	queue: new Map(),
	processing: new Set(),
	intervalId: null,
	retryConfig: { maxRetries: DEFAULT_MAX_RETRIES },
};

/**
 * Processes a batch of patches for a specific actId
 */
async function processPatchBatch(
	experimental_storage: GiselleStorage,
	item: QueuedPatch,
): Promise<void> {
	// Read current indexes
	const currentIndexes = await getActGenerationIndexes({
		experimental_storage,
		actId: item.actId,
	});

	// Apply all patches in batch
	const updatedIndexes = applyPatches(currentIndexes, item.patches);

	// Write back
	await experimental_storage.setJson({
		path: actGenerationIndexesPath(item.actId),
		data: updatedIndexes,
		schema: NodeGenerationIndex.array(),
	});
}

/**
 * Processes the queue for all pending actIds
 */
async function processQueue(experimental_storage: GiselleStorage) {
	if (state.queue.size === 0) {
		return;
	}

	// Get all items to process
	const itemsToProcess = Array.from(state.queue.entries());

	// Clear the queue
	state.queue.clear();

	// Process each act's patches
	for (const [actId, item] of itemsToProcess) {
		// Skip if already processing this actId
		if (state.processing.has(actId)) {
			// Re-queue for next batch
			const existingItem = state.queue.get(actId);
			if (existingItem) {
				existingItem.patches.push(...item.patches);
			} else {
				state.queue.set(actId, item);
			}
			continue;
		}

		state.processing.add(actId);

		try {
			await processPatchBatch(experimental_storage, item);
		} catch (error) {
			// Handle failure with retry logic
			if (item.retryCount < state.retryConfig.maxRetries) {
				// Re-queue with incremented retry count
				const retryItem: QueuedPatch = {
					...item,
					retryCount: item.retryCount + 1,
					timestamp: Date.now(),
				};
				const existingItem = state.queue.get(actId);
				if (existingItem) {
					// Merge with existing patches
					existingItem.patches.unshift(...retryItem.patches);
					existingItem.retryCount = Math.max(
						existingItem.retryCount,
						retryItem.retryCount,
					);
				} else {
					state.queue.set(actId, retryItem);
				}
				console.warn(
					`Generation index patch failed for act ${actId}, retry ${item.retryCount + 1}/${state.retryConfig.maxRetries}:`,
					error,
				);
			} else {
				// Permanent failure - log with severe warning
				console.error(
					`Generation index patch permanently failed for act ${actId} after ${state.retryConfig.maxRetries} retries. Data loss may occur:`,
					error,
					"Failed patches:",
					item.patches,
				);
			}
		} finally {
			state.processing.delete(actId);
		}
	}
}

/**
 * Starts the batch processing interval
 */
function startProcessing(experimental_storage: GiselleStorage) {
	if (state.intervalId !== null) {
		return;
	}

	state.intervalId = setInterval(() => {
		processQueue(experimental_storage).catch((error) => {
			console.error(
				"Unhandled error in generation index queue processing:",
				error,
			);
		});
	}, BATCH_INTERVAL_MS);
}

/**
 * Stops the batch processing interval
 */
function stopProcessing() {
	if (state.intervalId !== null) {
		clearInterval(state.intervalId);
		state.intervalId = null;
	}
}

/**
 * Enqueues a patch for the given actId
 */
function enqueuePatch(
	experimental_storage: GiselleStorage,
	actId: ActId,
	patch: GenerationIndexPatch,
) {
	const existingItem = state.queue.get(actId);

	if (existingItem) {
		// Add to existing patches
		existingItem.patches.push(patch);
	} else {
		// Create new queue item
		state.queue.set(actId, {
			actId,
			patches: [patch],
			timestamp: Date.now(),
			retryCount: 0,
		});
	}

	// Start processing if not already started
	startProcessing(experimental_storage);
}

/**
 * Flushes all pending patches immediately
 */
export async function flushGenerationIndexQueue(
	experimental_storage: GiselleStorage,
	options?: { skipRestart?: boolean },
) {
	// Stop the interval to prevent concurrent processing
	stopProcessing();

	try {
		// Process all pending items
		while (state.queue.size > 0 || state.processing.size > 0) {
			if (state.processing.size > 0) {
				// Wait for current processing to complete
				await new Promise((resolve) => setTimeout(resolve, 10));
				continue;
			}
			await processQueue(experimental_storage);
		}
	} finally {
		// If skipRestart is true, cleanup instead of restarting
		if (options?.skipRestart) {
			cleanupGenerationIndexQueue();
		} else {
			// Restart the interval
			startProcessing(experimental_storage);
		}
	}
}

/**
 * Public API for updating act generation indexes
 */
export function updateActGenerationIndexes(
	experimental_storage: GiselleStorage,
	actId: ActId,
	newIndex: NodeGenerationIndex,
) {
	// Create an upsert patch
	const patch = upsert(newIndex);

	// Enqueue the patch
	enqueuePatch(experimental_storage, actId, patch);
}

/**
 * Flushes patches for a specific actId
 */
async function flushForActId(
	experimental_storage: GiselleStorage,
	actId: ActId,
) {
	const maxWaitTime = 5000; // 5 seconds max wait
	const startTime = Date.now();

	while (Date.now() - startTime < maxWaitTime) {
		// Check if this actId has pending patches or is being processed
		if (!state.queue.has(actId) && !state.processing.has(actId)) {
			return;
		}

		// If there are patches in the queue for this actId, process immediately
		const item = state.queue.get(actId);
		if (item && !state.processing.has(actId)) {
			state.queue.delete(actId);
			state.processing.add(actId);

			try {
				await processPatchBatch(experimental_storage, item);
			} catch (error) {
				// Handle the same retry logic as in processQueue
				if (item.retryCount < state.retryConfig.maxRetries) {
					const retryItem: QueuedPatch = {
						...item,
						retryCount: item.retryCount + 1,
						timestamp: Date.now(),
					};
					state.queue.set(actId, retryItem);
					console.warn(
						`Generation index patch failed for act ${actId}, retry ${item.retryCount + 1}/${state.retryConfig.maxRetries}:`,
						error,
					);
				} else {
					console.error(
						`Generation index patch permanently failed for act ${actId} after ${state.retryConfig.maxRetries} retries:`,
						error,
					);
				}
			} finally {
				state.processing.delete(actId);
			}
		}

		// Wait a bit before checking again
		await new Promise((resolve) => setTimeout(resolve, 10));
	}

	console.warn(
		`Timeout waiting for generation index patches to complete for act ${actId}`,
	);
}

/**
 * Creates a patch queue context for batch operations
 * Useful when you want to batch multiple updates together
 */
export function createGenerationIndexPatchQueue(
	experimental_storage: GiselleStorage,
) {
	return {
		/**
		 * Enqueues an upsert patch for a generation index
		 */
		upsert: (actId: ActId, index: NodeGenerationIndex) => {
			enqueuePatch(experimental_storage, actId, upsert(index));
		},

		/**
		 * Enqueues a remove patch for a generation index
		 */
		remove: (actId: ActId, generationId: GenerationId) => {
			enqueuePatch(experimental_storage, actId, {
				type: "remove",
				generationId,
			});
		},

		/**
		 * Flushes all pending patches
		 */
		flush: () => flushGenerationIndexQueue(experimental_storage),

		/**
		 * Flushes patches for a specific actId
		 */
		flushActId: (actId: ActId) => flushForActId(experimental_storage, actId),
	};
}

// Cleanup function for tests or shutdown
function cleanupGenerationIndexQueue() {
	stopProcessing();
	state.queue.clear();
	state.processing.clear();
}
