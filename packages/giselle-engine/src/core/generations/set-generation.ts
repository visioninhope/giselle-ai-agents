import type { Generation } from "@giselle-sdk/data-type";
import type { GiselleEngineContext } from "../types";
import { setGeneration as setGenerationInternal } from "./utils";

export async function setGeneration(args: {
	context: GiselleEngineContext;
	generation: Generation;
}) {
	await setGenerationInternal({
		storage: args.context.storage,
		generation: args.generation,
	});
}
