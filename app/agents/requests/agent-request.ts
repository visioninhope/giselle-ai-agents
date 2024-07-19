import type { RequestStatus, RequestStepStatus } from "@/drizzle/schema";

export type RequestStep = {
	id: number;
	node: {
		id: number;
		className: string;
	};
	status: RequestStepStatus;
	request: {
		id: number;
	};
};

export type AgentRequest = {
	blueprint: {
		id: number;
	};
	id: number;
	status: RequestStatus;
	steps: Array<RequestStep>;
};

type AssertAgentRequest = (value: unknown) => asserts value is AgentRequest;
/**
 * @todo Implement this function
 */
export const assertAgentRequest: AssertAgentRequest = (value) => {
	return;
};
