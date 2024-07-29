import type { RequestStatus, RequestStepStatus } from "@/drizzle/schema";

export type Step = {
	id: number;
	node: {
		id: number;
		className: string;
	};
	status: RequestStepStatus;
	request: {
		id: number;
	};
	requestStep: {
		id: number;
		input: Array<{ portId: number; value: string }>;
		output: Array<{ portId: number; value: string }>;
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
