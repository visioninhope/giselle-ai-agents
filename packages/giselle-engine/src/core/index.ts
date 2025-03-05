import type { QueuedGeneration } from "@giselle-sdk/data-type";
import { generateText } from "./generations/generate-text";
import type { GiselleEngineConfig, GiselleEngineContext } from "./types";
import { createWorkspace } from "./workspaces";
export * from "./types";

export function GiselleEngine(config: GiselleEngineConfig) {
	const context: GiselleEngineContext = {
		storage: config.storage,
		llmProviders: config.llmProviders ?? [],
	};
	return {
		createWorkspace: async () => {
			return await createWorkspace({ context });
		},
		generateText: async (generation: QueuedGeneration) => {
			return await generateText({
				context,
				generation,
			});
		},
	};
}

export type GiselleEngine = ReturnType<typeof GiselleEngine>;
