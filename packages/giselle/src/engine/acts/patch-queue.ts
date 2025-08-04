import type { ActId } from "../../concepts/identifiers";
import type { GiselleEngineContext } from "../types";
import { type Patch, patchAct } from "./patch-act";

interface QueuedPatch {
	actId: ActId;
	patches: Patch[];
	timestamp: number;
	retryCount: number;
}

interface PatchQueueState {
	queue: QueuedPatch[];
	processing: boolean;
	intervalId: NodeJS.Timeout | null;
	context: GiselleEngineContext;
	retryConfig: RetryConfig;
}

const BATCH_INTERVAL_MS = 50; // Process batches every 50ms
const DEFAULT_MAX_RETRIES = 3; // Maximum number of retry attempts

interface RetryConfig {
	maxRetries: number;
}

/**
 * Creates a patch queue system for managing concurrent patch operations
 * Ensures patches are applied in FIFO order and prevents race conditions
 */
export function createPatchQueue(
	context: GiselleEngineContext,
	retryConfig: RetryConfig = { maxRetries: DEFAULT_MAX_RETRIES },
) {
	const state: PatchQueueState = {
		queue: [],
		processing: false,
		intervalId: null,
		context,
		retryConfig,
	};

	/**
	 * Merges patches for the same actId to optimize database operations
	 * Keeps patches in the order they were received for consistency
	 */
	function mergePatchesForAct(patches: Patch[]): Patch[] {
		const pathMap = new Map<string, Patch>();

		for (const patch of patches) {
			const existing = pathMap.get(patch.path);

			if (!existing) {
				pathMap.set(patch.path, patch);
				continue;
			}

			// Merge patches for the same path
			if ("set" in patch && "set" in existing) {
				// Later set operations override earlier ones
				pathMap.set(patch.path, patch);
			} else if ("increment" in patch && "increment" in existing) {
				// Combine increment operations
				pathMap.set(patch.path, {
					path: patch.path,
					increment: existing.increment + patch.increment,
				});
			} else if ("decrement" in patch && "decrement" in existing) {
				// Combine decrement operations
				pathMap.set(patch.path, {
					path: patch.path,
					decrement: existing.decrement + patch.decrement,
				});
			} else if ("push" in patch && "push" in existing) {
				// Combine push operations
				pathMap.set(patch.path, {
					path: patch.path,
					push: [...existing.push, ...patch.push],
				});
			} else {
				// Different operation types - keep the later one
				pathMap.set(patch.path, patch);
			}
		}

		return Array.from(pathMap.values());
	}

	/**
	 * Groups and merges queued patches by actId
	 */
	function processBatch(): QueuedPatch[] {
		if (state.queue.length === 0) {
			return [];
		}

		// Group patches by actId while preserving order and tracking retry counts
		const actGroups = new Map<
			string,
			{ actId: ActId; patches: Patch[]; maxRetryCount: number }
		>();

		for (const item of state.queue) {
			const actIdStr = item.actId;
			const existing = actGroups.get(actIdStr);

			if (existing) {
				existing.patches.push(...item.patches);
				// Keep the maximum retry count when batching items
				existing.maxRetryCount = Math.max(
					existing.maxRetryCount,
					item.retryCount,
				);
			} else {
				actGroups.set(actIdStr, {
					actId: item.actId,
					patches: [...item.patches],
					maxRetryCount: item.retryCount,
				});
			}
		}

		// Merge patches for each act and create batch
		const batch: QueuedPatch[] = [];
		for (const group of actGroups.values()) {
			const mergedPatches = mergePatchesForAct(group.patches);
			if (mergedPatches.length > 0) {
				batch.push({
					actId: group.actId,
					patches: mergedPatches,
					timestamp: Date.now(),
					retryCount: group.maxRetryCount,
				});
			}
		}

		// Clear the queue
		state.queue = [];

		return batch;
	}

	/**
	 * Processes the current batch of patches
	 */
	async function processQueue() {
		if (state.processing || state.queue.length === 0) {
			return;
		}

		state.processing = true;

		try {
			const batch = processBatch();

			// Process each act's patches sequentially to maintain order
			for (const item of batch) {
				try {
					await patchAct({
						context: state.context,
						actId: item.actId,
						patches: item.patches,
					});
				} catch (error) {
					// Handle individual patch failures
					if (item.retryCount < state.retryConfig.maxRetries) {
						// Re-queue at the front with incremented retry count
						const retryItem: QueuedPatch = {
							...item,
							retryCount: item.retryCount + 1,
							timestamp: Date.now(),
						};
						state.queue.unshift(retryItem);
						console.warn(
							`Patch failed for act ${item.actId}, retry ${item.retryCount + 1}/${state.retryConfig.maxRetries}:`,
							error,
						);
					} else {
						// Permanent failure - log with severe warning
						console.error(
							`Patch permanently failed for act ${item.actId} after ${state.retryConfig.maxRetries} retries. Data loss may occur:`,
							error,
							"Failed patches:",
							item.patches,
						);
					}
				}
			}
		} catch (error) {
			console.error("Error processing patch queue:", error);
		} finally {
			state.processing = false;
		}
	}

	/**
	 * Starts the batch processing interval
	 */
	function startProcessing() {
		if (state.intervalId !== null) {
			return;
		}

		state.intervalId = setInterval(() => {
			processQueue().catch((error) => {
				console.error("Unhandled error in patch queue processing:", error);
			});
		}, BATCH_INTERVAL_MS);
	}

	/**
	 * Stops the batch processing and cleans up resources
	 * Waits for all remaining patches to be processed before returning
	 */
	async function cleanup() {
		if (state.intervalId !== null) {
			clearInterval(state.intervalId);
			state.intervalId = null;
		}

		// Process any remaining patches before cleanup
		if (state.queue.length > 0) {
			try {
				await processQueue();
			} catch (error) {
				console.error("Error processing final patch batch:", error);
				throw error; // Re-throw to ensure caller is aware of the failure
			}
		}
	}

	/**
	 * Adds patches to the queue for processing
	 */
	function enqueuePatch(actId: ActId, patches: Patch[]) {
		if (patches.length === 0) {
			return;
		}

		state.queue.push({
			actId,
			patches,
			timestamp: Date.now(),
			retryCount: 0,
		});

		// Start processing if not already started
		startProcessing();
	}

	/**
	 * Creates an applyPatches function that uses the queue
	 */
	function createApplyPatches() {
		return (actId: ActId, patches: Patch[]) => {
			enqueuePatch(actId, patches);
		};
	}

	return {
		createApplyPatches,
		cleanup,
		// Exposed for testing
		_internal: {
			getQueueLength: () => state.queue.length,
			isProcessing: () => state.processing,
			processQueue,
		},
	};
}
