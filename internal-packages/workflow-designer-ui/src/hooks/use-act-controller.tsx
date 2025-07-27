import { useToasts } from "@giselle-internal/ui/toast";
import type {
	ActPatchAdapter,
	CreateActInputs,
	ExecutionContext,
	Generation,
	GenerationAdapter,
} from "@giselle-sdk/giselle";
import { executeAct, type GenerationId } from "@giselle-sdk/giselle";
import {
	useGenerationRunnerSystem,
	useGiselleEngine,
	useWorkflowDesigner,
} from "@giselle-sdk/giselle/react";
import { useCallback, useMemo, useRef } from "react";

type CreateAndStartActParams = Omit<
	CreateActInputs,
	"generationOriginType" | "workspace" | "workspaceId"
>;

export function useActController() {
	const { data } = useWorkflowDesigner();
	const client = useGiselleEngine();
	const { addGenerationRunner, startGenerationRunner, stopGenerationRunner } =
		useGenerationRunnerSystem();
	const cancelRef = useRef(false);
	const { info } = useToasts();
	const actGenerationsRef = useRef<Generation[]>([]);

	// Create adapters for the shared execution utilities
	const patchAdapter = useMemo<ActPatchAdapter>(
		() => ({
			applyPatches: async (actId, patches) => {
				await client.patchAct({ actId, patches });
			},
		}),
		[client],
	);

	const generationAdapter = useMemo<GenerationAdapter<Generation>>(
		() => ({
			getGeneration: (generationId) => {
				return Promise.resolve(
					actGenerationsRef.current.find((g) => g.id === generationId),
				);
			},
			startGeneration: async (generationId, callbacks) => {
				await startGenerationRunner(generationId as GenerationId, {
					onGenerationCompleted: callbacks?.onCompleted,
					onGenerationFailed: callbacks?.onFailed,
				});
			},
			stopGeneration: async (generationId) => {
				await stopGenerationRunner(generationId as GenerationId);
			},
		}),
		[startGenerationRunner, stopGenerationRunner],
	);

	const createAndStartAct = useCallback(
		async ({ startNodeId, inputs }: CreateAndStartActParams) => {
			const { act, generations } = await client.createAct({
				startNodeId,
				workspaceId: data.id,
				generationOriginType: "studio",
				inputs,
			});
			addGenerationRunner(generations);
			actGenerationsRef.current = generations;

			cancelRef.current = false;
			info("Workflow submitted successfully", {
				action: {
					label: "Cancel",
					onClick: async () => {
						cancelRef.current = true;
						await Promise.all(
							actGenerationsRef.current.map((generation) =>
								stopGenerationRunner(generation.id),
							),
						);
					},
				},
			});

			const executionContext: ExecutionContext<Generation> = {
				actId: act.id,
				patchAdapter,
				generationAdapter,
			};

			await executeAct({
				act,
				context: executionContext,
				options: {
					cancelSignal: cancelRef,
					// Note: Error annotations are included by default in shared logic
					// but without sequenceId and stepId since React doesn't have that context
					includeErrorAnnotations: false, // Disable for React since we don't have sequence/step IDs
				},
			});
		},
		[
			data,
			client,
			info,
			addGenerationRunner,
			stopGenerationRunner,
			patchAdapter,
			generationAdapter,
		],
	);

	return {
		createAndStartAct,
	};
}
