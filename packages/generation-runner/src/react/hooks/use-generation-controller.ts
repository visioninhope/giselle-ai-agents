import type { GenerationId } from "@giselle-sdk/data-type";
import { useCallback, useMemo, useState } from "react";
import {
	type StartGeneration,
	useGenerationRunnerSystem,
} from "../contexts/generation-runner-system";
import { useNodeGenerations } from "./use-node-generations";

export function useGenerationController() {
	const {
		startGeneration: startGenerationSystem,
		stopGeneration,
		generations,
	} = useGenerationRunnerSystem();
	const [latestGenerationId, setLatestGenerationId] = useState<
		GenerationId | undefined
	>();
	const startGeneration = useCallback<StartGeneration>(
		async (generationContext, options) => {
			await startGenerationSystem(generationContext, {
				...options,
				onGenerationCreated: (generation) => {
					setLatestGenerationId(generation.id);
					options?.onGenerationCreated?.(generation);
				},
			});
		},
		[startGenerationSystem],
	);
	const isGenerating = useMemo(() => {
		const generation = generations.find(
			(generation) => generation.id === latestGenerationId,
		);
		return (
			generation?.status === "running" ||
			generation?.status === "created" ||
			generation?.status === "queued" ||
			generation?.status === "requested"
		);
	}, [latestGenerationId, generations]);
	return { startGeneration, isGenerating, stopGeneration };
}
