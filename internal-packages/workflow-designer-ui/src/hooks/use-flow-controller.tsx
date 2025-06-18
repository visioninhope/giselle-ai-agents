import type { Generation, Workflow } from "@giselle-sdk/data-type";
import {
	useGenerationRunnerSystem,
	useGiselleEngine,
} from "@giselle-sdk/giselle-engine/react";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { useCallback, useRef } from "react";
import {
	type FormInput,
	createGenerationsForFlow,
} from "../header/ui/trigger-input-dialog/helpers";
import { useToasts } from "../ui/toast";

export function useFlowController() {
	const { createGeneration, startGeneration, stopGeneration } =
		useGenerationRunnerSystem();
	const { data } = useWorkflowDesigner();
	const { info } = useToasts();
	const client = useGiselleEngine();

	const activeGenerationsRef = useRef<Generation[]>([]);
	const cancelRef = useRef(false);

	const stopFlow = useCallback(async () => {
		cancelRef.current = true;
		await Promise.all(
			activeGenerationsRef.current.map((generation) =>
				stopGeneration(generation.id),
			),
		);
	}, [stopGeneration]);

	const startFlow = useCallback(
		async (
			flow: Workflow | null,
			inputs: FormInput[],
			values: Record<string, string | number>,
			onComplete?: () => void,
		) => {
			if (flow === null) {
				return;
			}
			const generations = createGenerationsForFlow(
				flow,
				inputs,
				values,
				createGeneration,
				data.id,
			);
			activeGenerationsRef.current = generations;

			cancelRef.current = false;
			info("Workflow submitted successfully", {
				action: (
					<button
						type="button"
						className="bg-white rounded-[4px] text-black-850 px-[8px] text-[14px] py-[2px] cursor-pointer"
						onClick={async () => {
							await stopFlow();
						}}
					>
						Cancel
					</button>
				),
			});

			const { run } = await client.createRun({
				workspaceId: data.id,
				jobsCount: flow.jobs.length,
				trigger: "manual",
			});
			const flowStartedAt = Date.now();
			let hasFlowError = false;
			for (const [jobIndex, job] of flow.jobs.entries()) {
				await client.patchRun({
					flowRunId: run.id,
					delta: {
						"steps.inProgress": { increment: 1 },
						"steps.queued": { decrement: 1 },
					},
				});
				const jobStartedAt = Date.now();
				let totalTasks = 0;
				let hasJobError = false;
				await Promise.all(
					job.operations.map(async (operation) => {
						const generation = generations.find(
							(g) => g.context.operationNode.id === operation.node.id,
						);
						if (generation === undefined) {
							return;
						}
						if (cancelRef.current) {
							return;
						}
						await startGeneration(generation.id, {
							onGenerationFailed: async (generation) => {
								hasJobError = true;
								hasFlowError = true;
								await client.patchRun({
									flowRunId: run.id,
									delta: {
										annotations: {
											push: [
												{
													level: "error",
													message: generation.error.message,
												},
											],
										},
									},
								});
							},
						});
						totalTasks += Date.now() - jobStartedAt;
					}),
				);

				if (jobIndex === 0 && onComplete) {
					onComplete();
				}

				if (hasJobError) {
					await client.patchRun({
						flowRunId: run.id,
						delta: {
							"steps.failed": { increment: 1 },
							"steps.inProgress": { decrement: 1 },
							"duration.totalTask": { increment: totalTasks },
						},
					});
				} else {
					await client.patchRun({
						flowRunId: run.id,
						delta: {
							"steps.completed": { increment: 1 },
							"steps.inProgress": { decrement: 1 },
							"duration.totalTask": { increment: totalTasks },
						},
					});
				}
			}
			if (hasFlowError) {
				await client.patchRun({
					flowRunId: run.id,
					delta: {
						status: { set: "failed" },
						"duration.wallClock": { set: Date.now() - flowStartedAt },
					},
				});
			} else {
				await client.patchRun({
					flowRunId: run.id,
					delta: {
						status: { set: "completed" },
						"duration.wallClock": { set: Date.now() - flowStartedAt },
					},
				});
			}
		},
		[createGeneration, data.id, info, startGeneration, stopFlow, client],
	);

	return { startFlow };
}
