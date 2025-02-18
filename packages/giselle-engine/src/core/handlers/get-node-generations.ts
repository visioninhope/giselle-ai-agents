import type { z } from "zod";
import { getGeneration, getNodeGenerationIndexes } from "../helpers";
import { getNodeGenerations } from "../schema";
import type { GiselleEngineHandlerArgs } from "./types";

const Input = getNodeGenerations.Input;
type Input = z.infer<typeof Input>;
const Output = getNodeGenerations.Output;
type Output = z.infer<typeof Output>;

const limit = 10;

export async function getNodeGenerationsHandler({
	context,
	unsafeInput,
}: GiselleEngineHandlerArgs<Input>): Promise<Output> {
	const input = Input.parse(unsafeInput);
	const nodeGenerationIndexes = await getNodeGenerationIndexes({
		...input,
		storage: context.storage,
	});
	if (nodeGenerationIndexes === undefined) {
		return {
			generations: [],
		};
	}
	return {
		generations: await Promise.all(
			nodeGenerationIndexes
				.sort((a, b) => b.createdAt - a.createdAt)
				.slice(0, limit)
				.reverse()
				.map((nodeGenerationIndex) =>
					getGeneration({
						generationId: nodeGenerationIndex.id,
						storage: context.storage,
					}),
				),
		).then((result) => result.filter((generation) => generation !== undefined)),
	};
}
