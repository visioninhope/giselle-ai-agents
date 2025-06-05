import type { Generation, Workflow } from "@giselle-sdk/data-type";
import { useGenerationRunnerSystem } from "@giselle-sdk/giselle-engine/react";
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

			for (const [jobIndex, job] of flow.jobs.entries()) {
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
						await startGeneration(generation.id);
					}),
				);

				if (jobIndex === 0 && onComplete) {
					onComplete();
				}
			}
		},
		[createGeneration, data.id, info, startGeneration, stopFlow],
	);

	return { startFlow };
}
