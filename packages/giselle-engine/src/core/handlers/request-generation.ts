import type { z } from "zod";
import {
	getGeneration,
	setGeneration,
	setNodeGenerationIndex,
} from "../helpers";
import { requestGeneration } from "../schema";
import type { GiselleEngineHandlerArgs } from "./types";

const Input = requestGeneration.Input;
type Input = z.infer<typeof Input>;

export async function requestGenerationHandler({
	context,
	unsafeInput,
}: GiselleEngineHandlerArgs<Input>) {
	const input = Input.parse(unsafeInput);
	const generation = await getGeneration({
		storage: context.storage,
		generationId: input.generationId,
	});
	if (generation?.status !== "queued") {
		throw new Error("Generation is not queued");
	}
	await Promise.all([
		setGeneration({
			storage: context.storage,
			generation: {
				...generation,
				status: "requested",
				requestedAt: Date.now(),
			},
		}),
		setNodeGenerationIndex({
			storage: context.storage,
			nodeId: generation.context.actionNode.id,
			origin: generation.context.origin,
			nodeGenerationIndex: {
				id: generation.id,
				nodeId: generation.context.actionNode.id,
				status: "requested",
				createdAt: generation.createdAt,
				ququedAt: generation.ququedAt,
				requestedAt: Date.now(),
			},
		}),
	]);
}
