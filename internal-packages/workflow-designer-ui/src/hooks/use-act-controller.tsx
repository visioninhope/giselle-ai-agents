import type { NodeId } from "@giselle-sdk/data-type";
import type { CreateActInputs, Generation } from "@giselle-sdk/giselle-engine";
import {
	useGenerationRunnerSystem,
	useGiselleEngine,
	useWorkflowDesigner,
} from "@giselle-sdk/giselle-engine/react";
import { buildWorkflowFromNode } from "@giselle-sdk/workflow-utils";
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
			for (const sequence of act.sequences) {
				await client.patchAct({
					actId: act.id,
					delta: {
						"steps.inProgress": { increment: 1 },
						"steps.queued": { decrement: 1 },
					},
				});
				const sequenceStartedAt = Date.now();
				const totalTasks = 0;
				const hasSequenceError = false;
				await Promise.all(
					sequence.steps.map(async (step) => {
						const generation = generations.find(
							(g) => g.id === step.generationId,
						);
						if (generation === undefined || cancelRef.current) {
							return { duration: 0, hasError: false };
						}
						let hasError = false;
						await startGenerationRunner(generation.id, {
							onGenerationFailed: async (failedGeneration) => {
								hasError = true;
								await client.patchAct({
									actId: act.id,
									delta: {
										annotations: {
											push: [
												{
													level: "error",
													message: failedGeneration.error.message,
												},
											],
										},
									},
								});
							},
						});
						return { duration: Date.now() - sequenceStartedAt, hasError };
					}),
				);
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
}
