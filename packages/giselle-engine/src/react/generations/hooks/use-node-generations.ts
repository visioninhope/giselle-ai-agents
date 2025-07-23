import type { NodeId } from "@giselle-sdk/data-type";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
	type Generation,
	GenerationOrigin,
} from "../../../engine/generations/object";
import { useFeatureFlag } from "../../feature-flags";
import { useGiselleEngine } from "../../use-giselle-engine";
import { useGenerationRunnerSystem } from "../contexts";

/**
 * Hook to fetch and manage node generations.
 * Uses object destructuring with nested destructuring in the parameters to avoid
 * reference equality issues that could cause infinite re-renders.
 * Provides generations filtered by nodeId and origin (id and type), sorted by creation time.
 */
export function useNodeGenerations({
	nodeId,
	origin,
}: {
	nodeId: NodeId;
	origin: GenerationOrigin;
}) {
	const {
		generations: allGenerations,
		createGenerationRunner,
		startGenerationRunner,
		createAndStartGenerationRunner,
		stopGenerationRunner: stopGenerationSystem,
		setGenerations,
	} = useGenerationRunnerSystem();
	const client = useGiselleEngine();
	const { experimental_storage } = useFeatureFlag();
	/** @todo fetch on server */
	const { data, isLoading } = useSWR(
		() => {
			const parsedOrigin = GenerationOrigin.parse(origin);
			return {
				api: "node-generations",
				origin: parsedOrigin,
				nodeId,
				useExperimentalStorage: experimental_storage,
			};
		},
		(args) => client.getNodeGenerations(args),
		{
			revalidateIfStale: false,
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		},
	);
	useEffect(() => {
		if (isLoading || data === undefined) {
			return;
		}
		const excludeCancelled = data.filter(
			(generation) => generation.status !== "cancelled",
		);
		setGenerations((prev) => {
			const filtered = prev.filter(
				(p) => !excludeCancelled.some((g) => g.id === p.id),
			);
			return [...filtered, ...excludeCancelled].sort(
				(a, b) => a.createdAt - b.createdAt,
			);
		});
	}, [isLoading, data, setGenerations]);

	const [currentGeneration, setCurrentGeneration] = useState<
		Generation | undefined
	>();

	const generations = useMemo(
		() =>
			allGenerations
				.filter(
					(generation) =>
						generation.context.operationNode.id === nodeId &&
						generation.context.origin.type === origin.type &&
						(origin.type === "studio"
							? generation.context.origin.type === "studio" &&
								generation.context.origin.workspaceId === origin.workspaceId
							: generation.context.origin.type !== "studio" &&
								generation.context.origin.actId === origin.actId),
				)
				.sort(
					(a, b) =>
						new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
				),
		[allGenerations, nodeId, origin],
	);

	useEffect(() => {
		if (generations.length === 0) {
			setCurrentGeneration(undefined);
		} else {
			// Since generations are sorted by creation time, the last one is the latest
			const latestGeneration = generations[generations.length - 1];
			setCurrentGeneration(latestGeneration);
		}
	}, [generations]);

	const isGenerating = useMemo(() => {
		const latestGeneration = generations[generations.length - 1];
		return (
			latestGeneration?.status === "running" ||
			latestGeneration?.status === "created" ||
			latestGeneration?.status === "queued"
		);
	}, [generations]);

	const stopGenerationRunner = useCallback(() => {
		const latestGeneration = generations[generations.length - 1];
		if (latestGeneration !== undefined) {
			stopGenerationSystem(latestGeneration.id);
		}
	}, [generations, stopGenerationSystem]);

	return {
		generations,
		createGenerationRunner,
		startGenerationRunner,
		createAndStartGenerationRunner,
		isGenerating,
		currentGeneration,
		stopGenerationRunner,
	};
}
