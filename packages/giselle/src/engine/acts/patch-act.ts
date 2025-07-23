import type { Act } from "../../concepts/act";
import type { ActId } from "../../concepts/identifiers";
import type { GiselleEngineContext } from "../types";
import {
	patchAct as patchActObject,
	type SimplePatch,
} from "./object/patch-object";
import { actPath } from "./object/paths";

export type { SimplePatch };

export async function patchAct(args: {
	context: GiselleEngineContext;
	actId: ActId;
	patches: SimplePatch[];
}) {
	// Get the current act
	const currentAct = await args.context.storage.getItem<Act>(
		actPath(args.actId),
	);

	if (!currentAct) {
		throw new Error(`Act not found: ${args.actId}`);
	}

	// Always update the updatedAt field
	const allPatches: SimplePatch[] = [
		...args.patches,
		{ path: "updatedAt", set: Date.now() },
	];

	// Apply the patches
	const updatedAct = patchActObject(currentAct, ...allPatches);

	await args.context.storage.setItem(actPath(args.actId), updatedAct);

	return updatedAct;
}
