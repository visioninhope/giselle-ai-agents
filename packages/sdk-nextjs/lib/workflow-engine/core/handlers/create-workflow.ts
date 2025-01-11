import { createIdGenerator } from "@/lib/utils/generate-id";
import { WorkflowData, workflowId } from "@/lib/workflow-data";
import { setGraphToStorage } from "../helpers/set-graph-to-storage";
import type { WorkflowEngineHandlerArgs } from "./types";

const workflowIdGenerator = createIdGenerator("wf");

export async function createWorkflow({ context }: WorkflowEngineHandlerArgs) {
	const id = workflowId.generate();
	const workflowData = WorkflowData.parse({
		id,
		nodes: [],
	});
	await setGraphToStorage({
		storage: context.storage,
		workflowId: id,
		workflowData,
	});
	return { workflowData };
}
