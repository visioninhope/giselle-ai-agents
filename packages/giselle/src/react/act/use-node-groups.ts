import {
	isOperationNode,
	isTriggerNode,
	type TriggerNode,
} from "@giselle-sdk/data-type";
import { useMemo } from "react";
import {
	groupNodes,
	type NodeGroup,
} from "../../engine/utils/workspace/group-nodes";
import { useWorkflowDesigner } from "../flow";

/**
 * Custom hook that groups connected nodes in the current workspace.
 * Returns an array of node groups, where each group is an array of connected node IDs.
 */
export function useNodeGroups() {
	const { data } = useWorkflowDesigner();

	return useMemo(() => {
		const operationNodeGroups: NodeGroup[] = [];
		const triggerNodeGroups: {
			node: TriggerNode;
			nodeGroup: NodeGroup;
		}[] = [];
		for (const group of groupNodes(data)) {
			const nodes = group.nodeIds
				.map((nodeId) => data.nodes.find((node) => node.id === nodeId))
				.filter((node) => node !== undefined);
			const existOperationNode = nodes.find((node) => isOperationNode(node));
			if (!existOperationNode) {
				continue;
			}
			const triggerNode = nodes.find((node) => isTriggerNode(node));
			if (triggerNode) {
				triggerNodeGroups.push({ node: triggerNode, nodeGroup: group });
			} else {
				operationNodeGroups.push(group);
			}
		}
		return {
			operationNodeGroups,
			triggerNodeGroups,
		};
	}, [data]);
}
