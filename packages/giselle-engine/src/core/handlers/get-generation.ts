import type { z } from "zod";
import { getGeneration } from "../helpers";
import { getGeneration as getGenerationsSchema } from "../schema";
import type { GiselleEngineHandlerArgs } from "./types";

const Input = getGenerationsSchema.Input;
type Input = z.infer<typeof Input>;
const Output = getGenerationsSchema.Output;
type Output = z.infer<typeof Output>;

export async function getGenerationHandler({
	context,
	unsafeInput,
}: GiselleEngineHandlerArgs<Input>) {
	const input = Input.parse(unsafeInput);
	const generation = await getGeneration({
		storage: context.storage,
		...input,
	});
	return Output.parse({ generation });
}
