import type { z } from "zod";
import {
	type NodeData,
	type WorkflowData,
	generateInitialWorkflowData,
} from "../workflow-data";
import {
	type CreateTextGenerationNodeParams,
	createTextGenerationNodeData,
} from "../workflow-data/node/text-generation";
import type {
	BaseNodeData,
	ConnectionHandle,
	NodeId,
} from "../workflow-data/node/types";

export interface WorkflowDesignerOperations {
	addTextGenerationNode: (
		params: z.infer<typeof CreateTextGenerationNodeParams>,
	) => void;
	getData: () => WorkflowData;
	updateNodeData: (nodeId: NodeId, data: NodeData) => void;
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
	function updateNodeData(nodeId: NodeId, data: NodeData) {
		nodes.set(nodeId, data);
	}

	return {
		addTextGenerationNode,
		getData,
		updateNodeData,
	};
}
