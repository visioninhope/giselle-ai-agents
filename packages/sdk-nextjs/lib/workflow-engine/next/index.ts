import type { NextRequest } from "next/server";
import { WorkflowEngine } from "..";

type AppRouteHandlers = Record<
	"GET" | "POST",
	(req: NextRequest) => Promise<Response>
>;

type WorkflowEngineConfig = unknown;
interface WokrflowEngineResult {
	handlers: AppRouteHandlers;
}

export function NextWorkflowEngine(
	config?: WorkflowEngineConfig,
): WokrflowEngineResult {
	const httpHandler = (req: NextRequest) => WorkflowEngine(req);
	return {
		handlers: {
			GET: httpHandler,
			POST: httpHandler,
		},
	};
}
