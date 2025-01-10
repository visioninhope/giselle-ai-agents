import { z } from "zod";

export const WorkflowData = z.object({
	nodes: z.array(z.number()),
});
export type WorkflowData = z.infer<typeof WorkflowData>;
