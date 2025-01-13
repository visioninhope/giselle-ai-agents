import { createIdGenerator } from "@/lib/utils/generate-id";
import { z } from "zod";
import { TextGenerationNodeData } from "./node/text-generation";

const NodeData = TextGenerationNodeData;
export const workflowId = createIdGenerator("wf");
export type WorkflowId = z.infer<typeof workflowId.schema>;
export const WorkflowData = z.object({
	id: workflowId.schema,
	nodes: z.array(NodeData),
});
export type WorkflowData = z.infer<typeof WorkflowData>;

export function generateInitialWorkflowData() {
	return WorkflowData.parse({
		id: workflowId.generate(),
		nodes: [],
	});
}
