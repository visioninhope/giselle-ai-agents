import type { Act } from "../../concepts/act";
import type { ActId } from "../../concepts/identifiers";
import type { GiselleEngineContext } from "../types";
import {
	patchAct as patchActObject,
	type SimplePatch,
} from "./object/patch-object";
import { actPath } from "./object/paths";

// Legacy type for backward compatibility
export type PatchDelta = Record<string, unknown>;

export async function patchAct(args: {
	context: GiselleEngineContext;
	actId: ActId;
	delta: PatchDelta;
}) {
	// Get the current act
	const currentAct = await args.context.storage.getItem<Act>(
		actPath(args.actId),
	);

	if (!currentAct) {
		throw new Error(`Act not found: ${args.actId}`);
	}

	// Convert legacy delta format to new SimplePatch format
	const patches: SimplePatch[] = [];

	for (const [path, value] of Object.entries(args.delta)) {
		if (typeof value === "object" && value !== null) {
			if ("set" in value) {
				patches.push({ path, set: value.set });
			} else if ("increment" in value) {
				patches.push({ path, increment: value.increment as number });
			} else if ("decrement" in value) {
				patches.push({ path, decrement: value.decrement as number });
			} else if ("push" in value) {
				patches.push({ path, push: value.push as unknown[] });
			}
		}
	}

	// Always update the updatedAt field
	patches.push({ path: "updatedAt", set: Date.now() });

	// Apply the patches
	const updatedAct = patchActObject(currentAct, ...patches);

	await args.context.storage.setItem(actPath(args.actId), updatedAct);

	return updatedAct;
}
