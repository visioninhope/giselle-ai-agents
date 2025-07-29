import type { Connection, ConnectionId, NodeId } from "@giselle-sdk/data-type";

export interface NodeGroup {
	nodeIds: NodeId[];
	connectionIds: ConnectionId[];
}

/**
 * Calculates a DAG (Directed Acyclic Graph) starting from a trigger node.
 * Traverses the graph in the forward direction (from output to input).
 * Returns all nodes and connections reachable from the trigger node.
 */
export function calculateDAGFromTrigger(
	triggerNodeId: NodeId,
	connections: Connection[],
): NodeGroup {
	const visitedNodes = new Set<NodeId>();
	const visitedConnections = new Set<ConnectionId>();

	// Initialize queue with the trigger node
	const queue: NodeId[] = [triggerNodeId];
	visitedNodes.add(triggerNodeId);

	// BFS traversal
	while (queue.length > 0) {
		const currentNodeId = queue.shift();
		if (!currentNodeId) continue;

		// Find all connections where current node is the output node
		const outgoingConnections = connections.filter(
			(connection) => connection.outputNode.id === currentNodeId,
		);

		for (const connection of outgoingConnections) {
			// Add connection to visited set
			visitedConnections.add(connection.id);

			// Add input node to queue if not visited
			const inputNodeId = connection.inputNode.id;
			if (!visitedNodes.has(inputNodeId)) {
				visitedNodes.add(inputNodeId);
				queue.push(inputNodeId);
			}
		}
	}

	return {
		nodeIds: Array.from(visitedNodes),
		connectionIds: Array.from(visitedConnections),
	};
}
