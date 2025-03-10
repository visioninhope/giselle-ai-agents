import { z } from "zod";
import { NodeBase } from "../base";

export const TextContent = z.object({
	type: z.literal("text"),
	text: z.string(),
});
type TextContent = z.infer<typeof TextContent>;

export const CreateTextNodeParams = TextContent.omit({
	type: true,
})
	.partial()
	.extend({
		name: z.string(),
	});

export const TextContentReference = z.object({
	type: TextContent.shape.type,
});
export type TextContentReference = z.infer<typeof TextContentReference>;
