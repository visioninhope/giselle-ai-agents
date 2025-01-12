import type { WorkflowData, WorkflowId } from "@/lib/workflow-data";
import type { Storage } from "unstorage";
import { workflowDataPath } from "./workflow-path";

export async function setGraphToStorage({
	storage,
	workflowId,
	workflowData,
}: {
	storage: Storage<WorkflowData>;
	workflowId: WorkflowId;
	workflowData: WorkflowData;
}) {
	await storage.setItem(workflowDataPath(workflowId), workflowData, {
		// Disable caching by setting cacheControlMaxAge to 0 for Vercel Blob storage
		cacheControlMaxAge: 0,
	});
}
