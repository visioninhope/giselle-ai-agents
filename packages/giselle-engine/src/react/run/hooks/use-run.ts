import type { Generation, Run } from "@giselle-sdk/data-type";
import { useMemo } from "react";
import { useRunSystem } from "../contexts";

interface RunHelpers {
	run: Run | undefined;
	generations: Generation[];
}
export function useRun(): RunHelpers {
	const { runs, activeRunId, runGenerations } = useRunSystem();
	const run = useMemo(
		() => runs.find((r) => r.id === activeRunId),
		[runs, activeRunId],
	);
	const generations = useMemo(
		() =>
			activeRunId === undefined ? [] : (runGenerations[activeRunId] ?? []),
		[activeRunId, runGenerations],
	);
	return { run, generations };
}
