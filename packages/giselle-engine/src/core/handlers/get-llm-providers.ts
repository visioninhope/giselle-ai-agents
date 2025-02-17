import { getLLMProviders } from "../schema";
import type { GiselleEngineHandlerArgs } from "./types";
const Output = getLLMProviders.Output;

export async function getLLMProvidersHandler({
	context,
}: GiselleEngineHandlerArgs) {
	return Output.parse({ llmProviders: context.llmProviders });
}
