import type { Node, NodeId } from "@giselle-sdk/data-type";
import { useMemo } from "react";
import type { NodeGroup } from "../../engine/utils/workspace/calculate-dag-from-trigger";
import { calculateDAGFromTrigger } from "../../engine/utils/workspace/calculate-dag-from-trigger";
import { useWorkflowDesigner } from "../flow";

/**
 * Represents a trigger node and its associated DAG (Directed Acyclic Graph).
 */
export interface TriggerDAG {
	triggerNodeId: NodeId;
	triggerNode: Node;
	dag: NodeGroup;
}

/**
 * Custom hook that finds all trigger nodes in the workspace and calculates their DAGs.
 * A trigger node is identified by having content.type === "trigger".
 *
 * @returns An array of TriggerDAG objects, each containing:
 * - triggerNodeId: The ID of the trigger node
 * - triggerNode: The trigger node itself
 * - dag: The NodeGroup containing all nodeIds and connectionIds reachable from the trigger
 */
export function useAllTriggerDAGs(): TriggerDAG[] {
	const { data } = useWorkflowDesigner();

	return useMemo(() => {
		// Find all nodes where content.type === "trigger"
		const triggerNodes = data.nodes.filter(
			(node): node is Node => node.content.type === "trigger",
		);

		// Calculate DAG for each trigger node
		return triggerNodes.map((triggerNode) => ({
			triggerNodeId: triggerNode.id,
			triggerNode,
			dag: calculateDAGFromTrigger(triggerNode.id, data.connections),
		}));
	}, [data.nodes, data.connections]);
}
