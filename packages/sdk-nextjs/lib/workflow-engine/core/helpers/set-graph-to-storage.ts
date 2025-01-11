import type { WorkflowData, WorkflowId } from "@/lib/workflow-data";
import type { Storage } from "unstorage";

export async function setGraphToStorage({
	storage,
	workflowId,
	workflowData,
}: {
	storage: Storage<WorkflowData>;
	workflowId: WorkflowId;
	workflowData: WorkflowData;
}) {
	await storage.setItem(`${workflowId}.json`, workflowData, {
		// Disable caching by setting cacheControlMaxAge to 0 for Vercel Blob storage
		cacheControlMaxAge: 0,
	});
}
