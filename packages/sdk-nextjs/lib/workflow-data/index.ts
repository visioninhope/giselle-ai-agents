import { createIdGenerator } from "@/lib/utils/generate-id";
import { z } from "zod";

export const workflowId = createIdGenerator("wf");
export type WorkflowId = z.infer<typeof workflowId.schema>;
export const WorkflowData = z.object({
	id: workflowId.schema,
	nodes: z.array(z.number()),
});
export type WorkflowData = z.infer<typeof WorkflowData>;
