import {
	type Connection,
	isOperationNode,
	type NodeId,
	type NodeLike,
} from "@giselle-sdk/data-type";

/**
 * Groups nodes into execution levels using topological sorting.
 *
 * This function:
 * - Filters to only operation nodes and their connections
 * - Calculates dependency levels based on connection patterns
 * - Returns an array where each sub-array represents nodes that can execute in parallel
 * - Level 0 contains nodes with no dependencies, level 1 contains nodes that depend only on level 0, etc.
 *
 * @param nodes - All nodes in the workflow
 * @param connections - All connections between nodes
 * @returns Array of arrays, each containing NodeIds that can execute at the same level
 */
export function buildLevels(
	nodes: NodeLike[],
	connections: Connection[],
): NodeId[][] {
	const operationNodes = nodes.filter(isOperationNode);
	const operationConnections = connections.filter(
		(conn) =>
			conn.outputNode.type === "operation" &&
			conn.inputNode.type === "operation",
	);

	// Calculate in-degrees for topological sort
	const inDegrees: Record<NodeId, number> = {};
	for (const node of operationNodes) {
		inDegrees[node.id] = 0;
	}

	// Track processed connections to handle duplicates
	const processedEdges = new Set<string>();
	for (const conn of operationConnections) {
		const edgeKey = `${conn.outputNode.id}-${conn.inputNode.id}`;
		if (!processedEdges.has(edgeKey)) {
			processedEdges.add(edgeKey);
			inDegrees[conn.inputNode.id] = (inDegrees[conn.inputNode.id] || 0) + 1;
		}
	}

	// Find nodes by level using topological sort
	const levels: NodeId[][] = [];
	const remainingNodes = new Set(operationNodes.map((n) => n.id));

	while (remainingNodes.size > 0) {
		const currentLevel: NodeId[] = [];

		for (const nodeId of remainingNodes) {
			if (inDegrees[nodeId] === 0) {
				currentLevel.push(nodeId);
			}
		}

		if (currentLevel.length === 0) {
			// If no nodes have in-degree 0, we have a cycle or disconnected components
			// Add all remaining nodes to break the cycle
			for (const nodeId of remainingNodes) {
				currentLevel.push(nodeId);
			}
		}

		levels.push(currentLevel);

		// Remove processed nodes and update in-degrees
		for (const nodeId of currentLevel) {
			remainingNodes.delete(nodeId);

			// Decrease in-degree of children
			for (const conn of operationConnections) {
				if (conn.outputNode.id === nodeId) {
					inDegrees[conn.inputNode.id]--;
				}
			}
		}
	}

	return levels;
}
