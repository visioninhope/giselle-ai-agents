import type { WorkflowData } from "@/lib/workflow-data";
import type { Storage } from "unstorage";

export type WorkflowId = `wf-${string}`;

export interface WorkflowEngineContext {
	storage: Storage<WorkflowData>;
	workflowId: WorkflowId;
}
