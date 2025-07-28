import type { NodeId } from "@giselle-sdk/data-type";
import { useMemo } from "react";
import { groupNodes } from "../../engine/utils/workspace/group-nodes";
import { useWorkflowDesigner } from "../flow";

/**
 * Custom hook that groups connected nodes in the current workspace.
 * Returns an array of node groups, where each group is an array of connected node IDs.
 */
export function useNodeGroups(): NodeId[][] {
	const { data } = useWorkflowDesigner();

	return useMemo(() => {
		return groupNodes(data);
	}, [data]);
}
