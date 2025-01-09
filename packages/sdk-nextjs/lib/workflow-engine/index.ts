import { z } from "zod";

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

export async function WorkflowEngine(
	request: Request,
	workflowConfig?: WorkflowConfig,
): Promise<Response> {
	return Response.json({ workflowEngine: "true" });
}
