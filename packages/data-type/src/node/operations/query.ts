import { z } from "zod/v4";

export const QueryContent = z.object({
	type: z.literal("query"),
	query: z.string(),
});
export type QueryContent = z.infer<typeof QueryContent>;

export const QueryContentReference = z.object({
	type: QueryContent.shape.type,
});
export type QueryContentReference = z.infer<typeof QueryContentReference>;
