import type { Step } from "./runner";

export const useWorkflow = () => {
	return {
		run: () => {},
		latestRunId: 'run_id'
};
