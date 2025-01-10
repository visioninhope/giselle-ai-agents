import { createStorage } from "unstorage";
import vercelBlobDriver from "unstorage/drivers/vercel-blob";
import type { WorkflowData } from "./lib/workflow-data";
import { NextWorkflowEngine } from "./lib/workflow-engine/next";

const storage = createStorage<WorkflowData>({
	driver: vercelBlobDriver({
		access: "public",
		base: "workflow-data",
	}),
});

export const workflowEngine = NextWorkflowEngine({
	basePath: "/api/workflow",
	storage,
});
