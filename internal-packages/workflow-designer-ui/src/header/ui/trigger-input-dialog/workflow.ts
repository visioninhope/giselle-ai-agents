import type { Generation, WorkspaceId } from "@giselle-sdk/data-type";
import type { useGenerationRunnerSystem } from "@giselle-sdk/giselle-engine/react";
import type { buildWorkflowFromNode } from "@giselle-sdk/workflow-utils";

import { type FormInput, toParameterItems } from "./helpers";

export function createGenerationsForFlow(
	flow: NonNullable<ReturnType<typeof buildWorkflowFromNode>>,
	inputs: FormInput[],
	values: Record<string, string | number>,
	createGeneration: ReturnType<
		typeof useGenerationRunnerSystem
	>["createGeneration"],
	workspaceId: WorkspaceId,
) {
	const generations: Generation[] = [];
	for (const job of flow.jobs) {
		for (const operation of job.operations) {
			const parameterItems =
				operation.node.content.type === "trigger"
					? toParameterItems(inputs, values)
					: [];
			const generation = createGeneration({
				origin: { type: "workspace", id: workspaceId },
				inputs:
					parameterItems.length > 0
						? [{ type: "parameters", items: parameterItems }]
						: [],
				...operation.generationTemplate,
			});
			generations.push(generation);
		}
	}
	return generations;
}
