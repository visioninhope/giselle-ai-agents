import type { RequestStatus, RequestStepStatus } from "@/drizzle/schema";

export type Step = {
	id: number;
	node: {
		id: string;
		className: string;
	};
	status: RequestStepStatus;
	request: {
		id: number;
	};
	requestStep: {
		id: number;
		input: Array<{ portId: string; value: string }>;
		output: Array<{ portId: string; value: string }>;
	};
};

export type AgentRequest = {
	blueprint: {
		id: number;
	};
	id: number;
	status: RequestStatus;
	steps: Array<Step>;
};

type AssertAgentRequest = (value: unknown) => asserts value is AgentRequest;
/**
 * @todo Implement this function
 */
export const assertAgentRequest: AssertAgentRequest = (value) => {
	return;
};
