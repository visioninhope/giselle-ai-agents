import { z } from "zod";
import { NodeBase, NodeReferenceBase } from "../base";
import {
	TextGenerationContent,
	TextGenerationContentReference,
} from "./text-generation";
export * from "./text-generation";

const ActionNodeContent = z.discriminatedUnion("type", [TextGenerationContent]);

export const ActionNode = NodeBase.extend({
	type: z.literal("action"),
	content: ActionNodeContent,
});
export type ActionNode = z.infer<typeof ActionNode>;

export function isActionNode(node: NodeBase): node is ActionNode {
	return node.type === "action";
}

const ActionNodeContentReference = z.discriminatedUnion("type", [
	TextGenerationContentReference,
]);
export const ActionNodeReference = NodeReferenceBase.extend({
	type: ActionNode.shape.type,
	content: ActionNodeContentReference,
});
export type ActionNodeReference = z.infer<typeof ActionNodeReference>;
