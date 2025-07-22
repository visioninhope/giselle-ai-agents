import type { GiselleEngineContext } from "../types";
import type { ActId, ActObject } from "./act/object";
import {
	type PatchDelta,
	patchAct as patchActObject,
} from "./act/patch-object";
import { actPath } from "./act/paths";

export type { PatchDelta };

export async function patchAct(args: {
	context: GiselleEngineContext;
	actId: ActId;
	delta: PatchDelta;
}) {
	// Get the current act
	const currentAct = await args.context.storage.getItem<ActObject>(
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
