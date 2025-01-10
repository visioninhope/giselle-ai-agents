import { WorkflowData } from "@/lib/workflow-data";
import type { WorkflowEngineHandlerArgs } from "./types";

export async function getGraph({ context }: WorkflowEngineHandlerArgs) {
	const result = await context.storage.getItem(`${context.workflowId}.json`);
	if (result === null) {
		throw new Error("Workflow not found");
	}
	return WorkflowData.parse(result);
}
