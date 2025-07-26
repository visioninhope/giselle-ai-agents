import { useToasts } from "@giselle-internal/ui/toast";
import type {
	ActPatchAdapter,
	CreateActInputs,
	ExecutionContext,
	Generation,
	GenerationAdapter,
} from "@giselle-sdk/giselle";
import {
	createStepCountPatches,
	createStepCountTransition,
	executeSequence,
	type GenerationId,
} from "@giselle-sdk/giselle";
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

			const actStartedAt = Date.now();
			let hasError = false;

			const executionContext: ExecutionContext<Generation> = {
				actId: act.id,
				patchAdapter,
				generationAdapter,
			};

			for (
				let sequenceIndex = 0;
				sequenceIndex < act.sequences.length;
				sequenceIndex++
			) {
				const sequence = act.sequences[sequenceIndex];
				const stepsCount = sequence.steps.length;

				if (hasError) {
					// Cancel remaining steps
					await patchAdapter.applyPatches(
						act.id,
						createStepCountPatches([
							createStepCountTransition("queued", "cancelled", stepsCount),
						]),
					);
					return;
				}

				// Move steps from queued to inProgress
				await patchAdapter.applyPatches(
					act.id,
					createStepCountPatches([
						createStepCountTransition("queued", "inProgress", stepsCount),
					]),
				);

				const result = await executeSequence(
					sequence,
					sequenceIndex,
					executionContext,
					{
						onStepComplete: async (step) => {
							await patchAdapter.applyPatches(
								act.id,
								createStepCountPatches([
									createStepCountTransition("inProgress", "completed", 1),
								]),
							);
							await patchAdapter.applyPatches(act.id, [
								{ path: "duration.totalTask", increment: step.duration },
							]);
						},
						onStepError: async (step, _, error) => {
							await patchAdapter.applyPatches(
								act.id,
								createStepCountPatches([
									createStepCountTransition("inProgress", "failed", 1),
								]),
							);
							await patchAdapter.applyPatches(act.id, [
								{ path: "duration.totalTask", increment: step.duration },
								{
									path: "annotations",
									push: [
										{
											level: "error",
											message:
												error instanceof Error
													? error.message
													: "Unknown error",
										},
									],
								},
							]);
						},
						cancelSignal: cancelRef,
					},
				);

				hasError = result.hasError;
			}

			// Update final act status
			await patchAdapter.applyPatches(act.id, [
				{ path: "status", set: hasError ? "failed" : "completed" },
				{ path: "duration.wallClock", set: Date.now() - actStartedAt },
			]);
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
