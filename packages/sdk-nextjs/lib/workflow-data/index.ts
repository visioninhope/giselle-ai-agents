import { createIdGenerator } from "@/lib/utils/generate-id";
import { z } from "zod";
import { TextGenerationNodeData } from "./node/text-generation";
import { nodeId } from "./node/types";

const NodeData = TextGenerationNodeData;
export type NodeData = z.infer<typeof NodeData>;
export const workflowId = createIdGenerator("wf");
export type WorkflowId = z.infer<typeof workflowId.schema>;

export const WorkflowData = z.object({
	id: workflowId.schema,
	nodes: z.preprocess(
		(args) => {
			if (typeof args !== "object" || args === null || args instanceof Map) {
				return args;
			}
			return new Map(Object.entries(args));
		},
		z.map(nodeId.schema, NodeData),
	),
});
export type WorkflowData = z.infer<typeof WorkflowData>;

export function generateInitialWorkflowData() {
	return WorkflowData.parse({
		id: workflowId.generate(),
		nodes: new Map(),
	});
}
