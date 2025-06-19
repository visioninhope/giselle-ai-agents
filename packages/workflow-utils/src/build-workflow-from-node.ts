import {
	type Connection,
	type ConnectionId,
	type NodeId,
	type NodeLike,
	type Workflow,
	WorkflowId,
} from "@giselle-sdk/data-type";
import {
	buildDownstreamNodeIdList,
	buildJobList,
	collectConnectedConnections,
	collectDownstreamNodes,
} from "./helper";

/**
 * Builds a workflow starting from a specific node ID.
 * Only includes nodes that are connected to/from the starting node.
 *
 * @param startNodeId - The ID of the node to start building the workflow from
 * @param nodes - Array of all node objects
 * @param connections - Array of all connection objects
 * @returns A workflow object or null if the node doesn't exist or isn't an operation node
 */
export function buildWorkflowForNode(
	startNodeId: NodeId,
	nodes: NodeLike[],
	connections: Connection[],
): Workflow | null {
	const nodeRecord: Record<NodeId, NodeLike> = Object.fromEntries(
		nodes.map((node) => [node.id, node]),
	);
	const connectionRecord: Record<ConnectionId, Connection> = Object.fromEntries(
		connections.map((connection) => [connection.id, connection]),
	);
	const startNode = nodeRecord[startNodeId];

	// Check if the node exists and is an operation node
	if (!startNode || startNode.type !== "operation") {
		return null;
	}

	// Create a map of downstream node IDs (output direction only)
	const downstreamNodeIdList = buildDownstreamNodeIdList(
		new Set(Object.values(connectionRecord)),
		new Set(Object.keys(nodeRecord) as NodeId[]),
	);

	// Find all downstream nodes from the starting node
	const downstreamNodes = collectDownstreamNodes(
		startNodeId,
		nodeRecord,
		downstreamNodeIdList,
	);
	const downstreamNodeIdSet = new Set<NodeId>(downstreamNodes.map((n) => n.id));

	for (const connection of Object.values(connectionRecord)) {
		if (
			downstreamNodeIdSet.has(connection.inputNode.id) &&
			connection.outputNode.type === "variable"
		) {
			const variableNode = nodeRecord[connection.outputNode.id];
			if (variableNode && !downstreamNodeIdSet.has(variableNode.id)) {
				downstreamNodes.push(variableNode);
				downstreamNodeIdSet.add(variableNode.id);
			}
		}
	}

	// Find all connections between the connected nodes
	const connectedConnections = collectConnectedConnections(
		downstreamNodeIdSet,
		new Set(Object.values(connectionRecord)),
	);

	// Generate a workflow ID
	const workflowId = WorkflowId.generate();

	// Create jobs based on the connected nodes and connections
	const jobList = buildJobList(
		new Set(downstreamNodes),
		new Set(connectedConnections),
		workflowId,
	);

	// Create and return the workflow
	return {
		id: workflowId,
		jobs: jobList,
		nodes: downstreamNodes,
	};
}
