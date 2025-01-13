import type { z } from "zod";
import {
	type WorkflowData,
	generateInitialWorkflowData,
} from "../workflow-data";
import {
	type CreateTextGenerationNodeParams,
	createTextGenerationNodeData,
} from "../workflow-data/node/text-generation";

export function WorkflowDesigner({
	defaultValue = generateInitialWorkflowData(),
}: {
	defaultValue?: WorkflowData;
}) {
	let workflowData = defaultValue;
	function addTextGenerationNode(
		params: z.infer<typeof CreateTextGenerationNodeParams>,
	) {
		const textgenerationNodeData = createTextGenerationNodeData(params);
		workflowData = {
			...workflowData,
			nodes: [...workflowData.nodes, textgenerationNodeData],
		};
	}

	function getData() {
		return workflowData;
	}

	return {
		addTextGenerationNode,
		getData,
	};
}
export type WorkflowDesigner = ReturnType<typeof WorkflowDesigner>;
