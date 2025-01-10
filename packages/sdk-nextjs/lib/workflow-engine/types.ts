import { z } from "zod";

export const WorkflowEngineAction = z.enum([
	"save-graph",
	"get-graph",
	"text-generation",
]);
type WorkflowEngineAction = z.infer<typeof WorkflowEngineAction>;

export interface WorkflowEngineRequest {
	action: WorkflowEngineAction;
	payload: unknown;
}
