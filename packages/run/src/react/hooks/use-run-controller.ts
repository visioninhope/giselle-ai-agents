import type { Run } from "@giselle-sdk/data-type";
import { type Cancel, type Perform, useRunSystem } from "../contexts";

interface UseRunControllerHelpers {
	perform: Perform;
	isRunning: boolean;
	runs: Run[];
	cancel: Cancel;
}

export function useRunController(): UseRunControllerHelpers {
	const { runs, perform, isRunning, cancel } = useRunSystem();
	return {
		runs,
		isRunning,
		perform,
		cancel,
	};
}
