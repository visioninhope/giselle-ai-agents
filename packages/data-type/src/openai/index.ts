import { z } from "zod";

const CreatingOpenAIVecrtorStore = z.object({
	status: z.literal("creating"),
});
const CreatedOpenAIVecrtorStore = z.object({
	status: z.literal("created"),
	id: z.string(),
});

export const OpenAIVecrtorStore = z.discriminatedUnion("status", [
	CreatingOpenAIVecrtorStore,
	CreatedOpenAIVecrtorStore,
]);
