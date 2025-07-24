import type { CreateActInputs, Generation } from "@giselle-sdk/giselle";
import {
	useGenerationRunnerSystem,
	useGiselleEngine,
	useWorkflowDesigner,
} from "@giselle-sdk/giselle/react";
import { useCallback, useRef } from "react";
import { useToasts } from "../ui/toast";

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
				action: (
					<button
						type="button"
						className="bg-white rounded-[4px] text-black-850 px-[8px] text-[14px] py-[2px] cursor-pointer"
						onClick={async () => {
							cancelRef.current = true;
							await Promise.all(
								actGenerationsRef.current.map((generation) =>
									stopGenerationRunner(generation.id),
								),
							);
						}}
					>
						Cancel
					</button>
				),
			});
			const actStartedAt = Date.now();
			let hasError = false;
			for (const sequence of act.sequences) {
				const stepsCount = sequence.steps.length;
				if (hasError) {
					await client.patchAct({
						actId: act.id,
						patches: [
							{ path: "steps.cancelled", increment: stepsCount },
							{ path: "steps.queued", decrement: stepsCount },
						],
					});
					return;
				}
				await client.patchAct({
					actId: act.id,
					patches: [
						{ path: "steps.inProgress", increment: stepsCount },
						{ path: "steps.queued", decrement: stepsCount },
					],
				});
				const sequenceStartedAt = Date.now();
				let durationTotalTasks = 0;
				await Promise.all(
					sequence.steps.map(async (step) => {
						const generation = generations.find(
							(g) => g.id === step.generationId,
						);
						if (generation === undefined || cancelRef.current) {
							return;
						}
						await startGenerationRunner(generation.id, {
							onGenerationCompleted: () => {
								durationTotalTasks += Date.now() - sequenceStartedAt;
							},
							onGenerationFailed: async (failedGeneration) => {
								hasError = true;
								await client.patchAct({
									actId: act.id,
									patches: [
										{
											path: "annotations",
											push: [
												{
													level: "error",
													message: failedGeneration.error.message,
												},
											],
										},
									],
								});
							},
						});

						await client.patchAct({
							actId: act.id,
							patches: hasError
								? [
										{ path: "steps.failed", increment: stepsCount },
										{ path: "steps.inProgress", decrement: stepsCount },
										{
											path: "duration.totalTask",
											increment: durationTotalTasks,
										},
									]
								: [
										{ path: "steps.completed", increment: stepsCount },
										{ path: "steps.inProgress", decrement: stepsCount },
										{
											path: "duration.totalTask",
											increment: durationTotalTasks,
										},
									],
						});
						return;
					}),
				);
				await client.patchAct({
					actId: act.id,
					patches: [
						{ path: "status", set: hasError ? "failed" : "completed" },
						{ path: "duration.wallClock", set: Date.now() - actStartedAt },
					],
				});
			}
		},
		[
			data,
			client,
			info,
			addGenerationRunner,
			startGenerationRunner,
			stopGenerationRunner,
		],
	);

	return {
		createAndStartAct,
	};
}
