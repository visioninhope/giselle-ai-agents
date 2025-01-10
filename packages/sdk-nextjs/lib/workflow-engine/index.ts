import { z } from "zod";
import type { WorkflowEngineRequest } from "./types";

const HandlerParams = z.object({
	command: z.string(),
});
type HandlerParams = z.infer<typeof HandlerParams>;
export async function handler(
	request: Request,
	{ command }: HandlerParams,
): Promise<Response> {
	return Response.json({ command });
}

export async function routerHanlerAdapter(
	request: Request,
	params: Promise<{ giselle: string[] }>,
) {
	const { giselle } = await params;
	const handlerParams = HandlerParams.parse({ command: giselle[1] });
	return handler(request, handlerParams);
}

type WorkflowConfig = unknown;

function toWorkflowEngineRequest(request: Request): WorkflowEngineRequest {
	request.url;
	const url = new URL(request.url);
	return {
		action: "get-graph",
	};
}

export async function WorkflowEngine(
	request: Request,
	workflowConfig?: WorkflowConfig,
): Promise<Response> {
	const { action } = toWorkflowEngineRequest(request);
	return Response.json({ workflowEngine: "true", action });
}
