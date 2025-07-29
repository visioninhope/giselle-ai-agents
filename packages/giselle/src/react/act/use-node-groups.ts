import { useMemo } from "react";
import { groupNodes } from "../../engine/utils/workspace/group-nodes";
import { useWorkflowDesigner } from "../flow";

/**
 * Custom hook that groups connected nodes in the current workspace.
 * Returns an array of node groups, where each group is an array of connected node IDs.
 */
export function useNodeGroups() {
	const { data } = useWorkflowDesigner();

	return useMemo(
		() =>
			groupNodes(data).map((group) => ({
				...group,
				nodes: group.nodeIds
					.map((nodeId) => data.nodes.find((node) => node.id === nodeId))
					.filter((node) => node !== undefined),
			})),
		[data],
	);
}
