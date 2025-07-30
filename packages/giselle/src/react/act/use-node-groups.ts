import {
	isOperationNode,
	isTriggerNode,
	type TriggerNode,
} from "@giselle-sdk/data-type";
import { useMemo } from "react";
import { sliceGraphFromNode } from "../../engine/utils/workflow/slice-graph-from-node";
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
			const connections = group.connectionIds
				.map((connectionId) =>
					data.connections.find((connection) => connection.id === connectionId),
				)
				.filter((connection) => connection !== undefined);
			const existOperationNode = nodes.find((node) => isOperationNode(node));
			if (!existOperationNode) {
				continue;
			}
			const triggerNodes = nodes.filter((node) => isTriggerNode(node));
			if (triggerNodes.length === 0) {
				operationNodeGroups.push(group);
				continue;
			}
			for (const triggerNode of triggerNodes) {
				const sliceGraph = sliceGraphFromNode(triggerNode, {
					nodes,
					connections,
				});
				triggerNodeGroups.push({
					node: triggerNode,
					nodeGroup: {
						nodeIds: sliceGraph.nodes.map((node) => node.id),
						connectionIds: sliceGraph.connections.map(
							(connection) => connection.id,
						),
					},
				});
			}
		}
		return {
			operationNodeGroups,
			triggerNodeGroups,
		};
	}, [data]);
}
