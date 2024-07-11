import type { RunProcessStatus, RunStatus } from "@/drizzle/schema";

export type AgentProcessItem = {
	id: number;
	node: {
		id: number;
		type: string;
	};
	status: RunProcessStatus;
	run: {
		id: number;
	};
};

export type AgentProcess = {
	agent: {
		id: number;
		blueprint: {
			id: number;
		};
	};
	run: {
		id: number;
		status: RunStatus;
		processes: Array<AgentProcessItem>;
	} | null;
};

type AssertAgentProcess = (value: unknown) => asserts value is AgentProcess;
/**
 * @todo Implement this function
 */
export const assertAgentProcess: AssertAgentProcess = (value) => {
	return;
};
