import type { z } from "zod";
import { openai } from "../../openai";
import { createOpenAIVectorStore } from "../schema";
import type { GiselleEngineHandlerArgs } from "./types";

const Input = createOpenAIVectorStore.Input;
type Input = z.infer<typeof Input>;
type Output = z.infer<typeof createOpenAIVectorStore.Output>;

export async function createOpenAIVectorStoreHandler({
	unsafeInput,
}: GiselleEngineHandlerArgs<Input>) {
	const input = Input.parse(unsafeInput);

	const vectorStore = await openai.beta.vectorStores.create({
		name: input.workspaceId,
		expires_after: {
			anchor: "last_active_at",
			days: 1,
		},
		metadata: {
			workspaceId: input.workspaceId,
		},
	});
	return { openaiVectorStoreId: vectorStore.id } satisfies Output;
}
