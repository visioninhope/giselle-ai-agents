import { Act } from "../../concepts/act";
import type { ActId } from "../../concepts/identifiers";
import type { GiselleEngineContext } from "../types";
import { type Patch, patchAct as patchActObject } from "./object/patch-object";
import { actPath } from "./object/paths";

export type { Patch };

export async function patchAct(args: {
	context: GiselleEngineContext;
	actId: ActId;
	patches: Patch[];
}) {
	console.log(actPath(args.actId));
	// Get the current act
	const currentAct = await args.context.experimental_storage.getJson({
		path: actPath(args.actId),
		schema: Act,
	});

	// Always update the updatedAt field
	const allPatches: Patch[] = [
		...args.patches,
		{ path: "updatedAt", set: Date.now() },
	];

	// Apply the patches
	const updatedAct = patchActObject(currentAct, ...allPatches);

	await args.context.experimental_storage.setJson({
		path: actPath(args.actId),
		data: updatedAct,
	});

	return updatedAct;
}
