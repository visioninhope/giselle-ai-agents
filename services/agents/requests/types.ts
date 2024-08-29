import type { Node } from "../nodes";
export type RequestId = `rqst_${string}`;
export type RequestStackId = `rqst.stck_${string}`;
export type RequestStepId = `rqst.stp_${string}`;

export type RequestStartHandlerArgs = {
	requestId: RequestId;
};
export type RequestStartHandler = (
	args: RequestStartHandlerArgs,
) => Promise<void>;

export const requestRunnerProvider = {
	vercelFunctions: "vercelFunctions",
	triggerDev: "triggerDev",
};
export type RequestRunnerProvider = keyof typeof requestRunnerProvider;

export const requestStepStatus = {
	queued: "queued",
	inProgress: "in_progress",
	cancelled: "cancelled",
	failed: "failed",
	completed: "completed",
	expired: "expired",
} as const;
export type RequestStepStatus =
	(typeof requestStepStatus)[keyof typeof requestStepStatus];
type RequestStep = {
	id: RequestStepId;
	nodeId: Node["id"];
	status: RequestStepStatus;
};
export type RequestStack = {
	id: RequestStackId;
	steps: RequestStep[];
};
export const requestStatus = {
	queued: "queued",
	inProgress: "in_progress",
	requiresAction: "requires_action",
	cancelling: "cancelling",
	cancelled: "cancelled",
	failed: "failed",
	completed: "completed",
	incomplete: "incomplete",
	expired: "expired",
} as const;
export type RequestStatus = (typeof requestStatus)[keyof typeof requestStatus];
export type Request = {
	id: RequestId;
	stacks: RequestStack[];
	status: RequestStatus;
};
