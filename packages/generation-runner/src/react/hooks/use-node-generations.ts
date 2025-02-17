import { GenerationOrigin } from "@giselle-sdk/data-type";
import { useEffect, useMemo } from "react";
import {
	type FetchNodeGenerationsParams,
	useGenerationRunnerSystem,
} from "../contexts";

/**
 * Hook to fetch and manage node generations.
 * Uses object destructuring with nested destructuring in the parameters to avoid
 * reference equality issues that could cause infinite re-renders.
 */
export function useNodeGenerations({
	nodeId,
	origin: { id: originId, type: originType },
}: FetchNodeGenerationsParams) {
	const { generations: allGenerations, fetchNodeGenerations } =
		useGenerationRunnerSystem();
	const generations = useMemo(
		() => allGenerations.filter((g) => g.context.actionNode.id === nodeId),
		[allGenerations, nodeId],
	);

	// Effect to fetch node generations
	// Using primitive values (originId, originType) in dependencies array instead of the origin object
	// to prevent infinite re-renders caused by new object references
	useEffect(() => {
		const origin = GenerationOrigin.parse({
			id: originId,
			type: originType,
		});
		fetchNodeGenerations({
			nodeId,
			origin,
		});
	}, [fetchNodeGenerations, originId, originType, nodeId]);
	return { generations };
}
