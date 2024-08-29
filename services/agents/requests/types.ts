export type RequestId = `rqst_${string}`;

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
