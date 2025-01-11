import type { WorkflowData } from "@/lib/workflow-data";
import type { Storage } from "unstorage";

export interface WorkflowEngineContext {
	storage: Storage<WorkflowData>;
}
