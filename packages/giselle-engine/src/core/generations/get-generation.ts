import type { GenerationId } from "@giselle-sdk/data-type";
import { getGeneration as getGenerationInternal } from "../helpers";
import type { GiselleEngineContext } from "../types";

export async function getGeneration(args: {
	context: GiselleEngineContext;
	generationId: GenerationId;
}) {
	return await getGenerationInternal({
		storage: args.context.storage,
		generationId: args.generationId,
	});
}
