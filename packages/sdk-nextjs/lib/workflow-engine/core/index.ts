import type { WorkflowData } from "@/lib/workflow-data";
import type { Storage } from "unstorage";
import { z } from "zod";
import { getGraph } from "./handlers/get-graph";
import { saveGraph } from "./handlers/save-grpah";
import { textGeneration } from "./handlers/text-generation";
import type { WorkflowEngineContext } from "./types";

export const WorkflowEngineAction = z.enum([
	"save-graph",
	"get-graph",
	"text-generation",
]);
type WorkflowEngineAction = z.infer<typeof WorkflowEngineAction>;

export interface WorkflowEngineRequest {
	action: WorkflowEngineAction;
	payload: unknown;
	context: WorkflowEngineContext;
}

export interface WorkflowEngineConfig {
	basePath: string;
	storage: Storage<WorkflowData>;
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
		context: {
			storage: config.storage,
			workflowId: "wf-test",
		},
	};
}

export async function WorkflowEngine(
	request: Request,
	config: WorkflowEngineConfig,
): Promise<Response> {
	const { action, payload, context } = await toWorkflowEngineRequest(
		request,
		config,
	);
	switch (action) {
		case "save-graph": {
			await saveGraph({
				context,
				unsafeInput: payload,
			});
			return new Response("Save Graph");
		}
		case "get-graph": {
			const workflowData = await getGraph({
				context,
			});
			return new Response("Get Graph");
		}
		case "text-generation":
			return textGeneration({
				context,
				unsafeInput: payload,
			});
		default: {
			const _exhaustiveCheck: never = action;
			return _exhaustiveCheck;
		}
	}
}
