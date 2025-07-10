import type { Generation } from "@giselle-sdk/data-type";
import type { GiselleEngineContext } from "../types";
import { internalSetGeneration } from "./internal/set-generation";

export async function setGeneration(args: {
	context: GiselleEngineContext;
	generation: Generation;
	useExperimentalStorage?: boolean;
}) {
	await internalSetGeneration({
		storage: args.context.storage,
		experimental_storage: args.context.experimental_storage,
		useExperimentalStorage: args.useExperimentalStorage,
		generation: args.generation,
	});
}
