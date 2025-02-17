import type { QueuedGeneration } from "@giselle-sdk/data-type";
import type { z } from "zod";
import {
	setGeneration,
	setGenerationIndex,
	setNodeGenerationIndex,
} from "../helpers";
import { addGeneration } from "../schema";
import type { GiselleEngineHandlerArgs } from "./types";

const Input = addGeneration.Input;
type Input = z.infer<typeof Input>;
const Output = addGeneration.Output;
type Output = z.infer<typeof Output>;

export async function addGenerationHandler({
	context,
	unsafeInput,
}: GiselleEngineHandlerArgs<Input>): Promise<Output> {
	const input = Input.parse(unsafeInput);

	const ququedGeneration = {
		...input.generation,
		status: "queued",
		ququedAt: Date.now(),
	} satisfies QueuedGeneration;

	await Promise.all([
		setGeneration({
			storage: context.storage,
			generation: ququedGeneration,
		}),
		setGenerationIndex({
			storage: context.storage,
			generationIndex: {
				id: ququedGeneration.id,
				origin: ququedGeneration.context.origin,
			},
		}),
		setNodeGenerationIndex({
			storage: context.storage,
			nodeId: ququedGeneration.context.actionNode.id,
			origin: ququedGeneration.context.origin,
			nodeGenerationIndex: {
				id: ququedGeneration.id,
				nodeId: ququedGeneration.context.actionNode.id,
				status: ququedGeneration.status,
				createdAt: ququedGeneration.createdAt,
				ququedAt: ququedGeneration.ququedAt,
			},
		}),
	]);
	return Output.parse({ generation: ququedGeneration });
}
