import { useMemo } from "react";
import { groupNodes } from "../../engine/utils/workspace/group-nodes";
import { useWorkflowDesigner } from "../flow";

/**
 * Custom hook that groups connected nodes in the current workspace.
 * Returns an object with operation and trigger node groups.
 */
export function useNodeGroups() {
	const { data } = useWorkflowDesigner();

	return useMemo(() => groupNodes(data), [data]);
}
