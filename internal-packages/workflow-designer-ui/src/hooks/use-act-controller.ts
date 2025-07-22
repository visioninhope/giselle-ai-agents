import type { NodeId } from "@giselle-sdk/data-type";
import { useWorkflowDesigner } from "@giselle-sdk/giselle-engine/react";
import { buildWorkflowFromNode } from "@giselle-sdk/workflow-utils";
import { useCallback } from "react";

interface CreateAndStartActParams {
	startNodeId: NodeId;
}

export function useActController() {
	const { data } = useWorkflowDesigner();
	const createAndStartAct = useCallback(
		({ startNodeId }: CreateAndStartActParams) => {
			const startNode = data.nodes.find((node) => node.id === startNodeId);
			if (startNode === undefined) {
				throw new Error(`Node with id ${startNodeId} not found`);
			}
			buildWorkflowFromNode(startNode, data);
		},
		[data],
	);
}
