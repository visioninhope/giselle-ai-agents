import type { z } from "zod";
import {
	type WorkflowData,
	generateInitialWorkflowData,
} from "../workflow-data";
import {
	type CreateTextGenerationNodeParams,
	createTextGenerationNodeData,
} from "../workflow-data/node/text-generation";

export interface WorkflowDesignerOperations {
	addTextGenerationNode: (
		params: z.infer<typeof CreateTextGenerationNodeParams>,
	) => void;
	getData: () => WorkflowData;
}

export function WorkflowDesigner({
	defaultValue = generateInitialWorkflowData(),
}: {
	defaultValue?: WorkflowData;
}): WorkflowDesignerOperations {
	const nodes = defaultValue.nodes;
	function addTextGenerationNode(
		params: z.infer<typeof CreateTextGenerationNodeParams>,
	) {
		const textgenerationNodeData = createTextGenerationNodeData(params);
		nodes.set(textgenerationNodeData.id, textgenerationNodeData);
	}
	function getData() {
		return {
			id: defaultValue.id,
			nodes,
		};
	}

	return {
		addTextGenerationNode,
		getData,
	};
}
