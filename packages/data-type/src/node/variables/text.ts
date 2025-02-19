import { z } from "zod";
import { NodeBase } from "../base";

export const TextContent = z.object({
	type: z.literal("text"),
	text: z.string(),
});
type TextContent = z.infer<typeof TextContent>;

export const TextNode = NodeBase.extend({
	type: z.literal("variable"),
	content: TextContent,
});
type TextNode = z.infer<typeof TextNode>;

export const CreateTextNodeParams = TextContent.omit({
	type: true,
})
	.partial()
	.extend({
		name: z.string(),
	});

export function isTextNode(node: {
	type: string;
	content: unknown;
}): node is { type: "variable"; content: TextContent } {
	return (
		node.type === "variable" && (node.content as TextContent).type === "text"
	);
}
