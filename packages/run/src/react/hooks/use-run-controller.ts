import type { Run } from "@giselle-sdk/data-type";
import { type Perform, useRunSystem } from "../contexts";

interface UseRunControllerHelpers {
	perform: Perform;
	runs: Run[];
}

export function useRunController(): UseRunControllerHelpers {
	const { runs, perform } = useRunSystem();
	return {
		runs,
		perform,
	};
}
