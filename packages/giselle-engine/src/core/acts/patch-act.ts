import type { ActId } from "../concepts/identifiers";
import type { GiselleEngineContext } from "../types";
import type { Act } from "./object";
import {
	type PatchDelta,
	patchAct as patchActObject,
} from "./object/patch-object";
import { actPath } from "./object/paths";

export type { PatchDelta };

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

	// Apply the patch
	const updatedAct = patchActObject(currentAct, {
		...args.delta,
		updatedAt: { set: Date.now() },
	});

	await args.context.storage.setItem(actPath(args.actId), updatedAct);

	return updatedAct;
}
