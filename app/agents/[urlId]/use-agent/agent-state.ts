import type { RunProcessStatus, RunStatus } from "@/drizzle/schema";

export type AgentState = {
	agent: {
		latestRun: {
			status: RunStatus;
			processes: Array<{
				id: number;
				node: {
					id: number;
					type: string;
				};
				run: {
					status: RunProcessStatus;
				};
			}>;
		} | null;
	};
};

type AssertAgentState = (value: unknown) => asserts value is AgentState;
/**
 * @todo Implement this function
 */
export const assertAgentState: AssertAgentState = (value) => {
	return;
};
