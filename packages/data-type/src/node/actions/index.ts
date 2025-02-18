import { z } from "zod";
import { NodeBase } from "../base";
import { TextGenerationContent } from "./text-generation";
export * from "./text-generation";

const ActionNodeContent = z.discriminatedUnion("type", [TextGenerationContent]);

export const ActionNode = NodeBase.extend({
	type: z.literal("action"),
	content: ActionNodeContent,
});
export type ActionNode = z.infer<typeof ActionNode>;

export const TextGenerationNode = ActionNode.extend({
	content: TextGenerationContent,
});
export type TextGenerationNode = z.infer<typeof TextGenerationNode>;

export function isActionNode(node: NodeBase): node is ActionNode {
	return node.type === "action";
}
