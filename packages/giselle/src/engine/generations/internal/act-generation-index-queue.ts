import { NodeGenerationIndex } from "../../../concepts/generation";
import type { ActId } from "../../../concepts/identifiers";
import { actGenerationIndexesPath } from "../../../concepts/path";
import type { GiselleStorage } from "../../experimental_storage";
import { getActGenerationIndexes } from "./get-act-generation-indexes";

// Per-actId operation queues to prevent race conditions
const actQueues = new Map<ActId, Promise<void>>();

function upsertIndex(
	indexes: NodeGenerationIndex[],
	newIndex: NodeGenerationIndex,
): NodeGenerationIndex[] {
	const existingIndex = indexes.findIndex((i) => i.id === newIndex.id);

	if (existingIndex === -1) {
		return [...indexes, newIndex];
	}

	return [
		...indexes.slice(0, existingIndex),
		newIndex,
		...indexes.slice(existingIndex + 1),
	];
}

async function executeUpdate(
	experimental_storage: GiselleStorage,
	actId: ActId,
	newIndex: NodeGenerationIndex,
) {
	// Read current indexes
	const currentIndexes = await getActGenerationIndexes({
		experimental_storage,
		actId,
	});

	// Update with new index
	const updatedIndexes = upsertIndex(currentIndexes || [], newIndex);

	// Write back
	await experimental_storage.setJson({
		path: actGenerationIndexesPath(actId),
		data: updatedIndexes,
		schema: NodeGenerationIndex.array(),
	});
}

export async function updateActGenerationIndexes(
	experimental_storage: GiselleStorage,
	actId: ActId,
	newIndex: NodeGenerationIndex,
) {
	const previousOperation = actQueues.get(actId) || Promise.resolve();

	const currentOperation = previousOperation.then(() =>
		executeUpdate(experimental_storage, actId, newIndex),
	);

	actQueues.set(actId, currentOperation);

	// Clean up completed operations to prevent memory leaks
	currentOperation.finally(() => {
		if (actQueues.get(actId) === currentOperation) {
			actQueues.delete(actId);
		}
	});

	// Wait for this operation to complete
	await currentOperation;
}
