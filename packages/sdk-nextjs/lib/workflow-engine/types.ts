export type WorkflowEngineAction =
	| "save-grpah"
	| "get-graph"
	| "text-generation";

export interface WorkflowEngineRequest {
	action: WorkflowEngineAction;
}
