import { textGeneration } from "./handlers/text-generation";
import { WorkflowEngineAction, type WorkflowEngineRequest } from "./types";

export interface WorkflowEngineConfig {
	basePath: string;
}

async function toWorkflowEngineRequest(
	request: Request,
	config: WorkflowEngineConfig,
): Promise<WorkflowEngineRequest> {
	request.url;
	const url = new URL(request.url);
	const pathname = url.pathname;
	const a = url.pathname.match(new RegExp(`^${config.basePath}(.+)`));

	const segmentString = a?.at(-1);
	if (segmentString == null)
		throw new Error(`Cannot parse action at ${pathname}`);
	const segments = segmentString.replace(/^\//, "").split("/").filter(Boolean);

	if (segments.length !== 1) throw new Error(`Invalid action at ${pathname}`);

	const [unsafeAction] = segments;

	const action = WorkflowEngineAction.parse(unsafeAction);

	return {
		action,
		payload: await request.json(),
	};
}

export async function WorkflowEngine(
	request: Request,
	config: WorkflowEngineConfig,
): Promise<Response> {
	const { action, payload } = await toWorkflowEngineRequest(request, config);
	switch (action) {
		case "get-graph":
			return new Response("Get Graph");
		case "text-generation":
			return textGeneration(payload);
	}
	return Response.json({ workflowEngine: "true", action });
}
