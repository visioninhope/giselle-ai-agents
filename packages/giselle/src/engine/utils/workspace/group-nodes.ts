import type { ConnectionId, NodeId, Workspace } from "@giselle-sdk/data-type";

export interface NodeGroup {
	nodeIds: NodeId[];
	connectionIds: ConnectionId[];
}

/**
 * Groups connected nodes in a workspace using Union-Find algorithm.
 * Returns an array of node groups with their nodeIds and internal connectionIds.
 */
export function groupNodes(
	workspace: Pick<Workspace, "nodes" | "connections">,
): NodeGroup[] {
	const nodeIds = workspace.nodes.map((node) => node.id);

	// Initialize parent map - each node is its own parent initially
	const parent = new Map<NodeId, NodeId>();
	for (const nodeId of nodeIds) {
		parent.set(nodeId, nodeId);
	}

	// Find root with path compression
	function findRoot(nodeId: NodeId): NodeId {
		const parentId = parent.get(nodeId);
		if (!parentId || parentId === nodeId) {
			return nodeId;
		}
		// Path compression: make nodes point directly to root
		const root = findRoot(parentId);
		parent.set(nodeId, root);
		return root;
	}

	// Union two nodes by connecting their roots
	function union(nodeId1: NodeId, nodeId2: NodeId): void {
		const root1 = findRoot(nodeId1);
		const root2 = findRoot(nodeId2);
		if (root1 !== root2) {
			parent.set(root2, root1);
		}
	}

	// Connect nodes based on workspace connections
	for (const connection of workspace.connections) {
		union(connection.outputNode.id, connection.inputNode.id);
	}

	// Group nodes by their root
	const groups = new Map<NodeId, Set<NodeId>>();
	for (const nodeId of nodeIds) {
		const root = findRoot(nodeId);
		if (!groups.has(root)) {
			groups.set(root, new Set());
		}
		groups.get(root)?.add(nodeId);
	}

	// Build NodeGroup objects with connectionIds
	const nodeGroups: NodeGroup[] = [];
	for (const nodeIdSet of groups.values()) {
		const nodeIds = Array.from(nodeIdSet);
		const connectionIds = workspace.connections
			.filter(
				(connection) =>
					nodeIdSet.has(connection.outputNode.id) &&
					nodeIdSet.has(connection.inputNode.id),
			)
			.map((connection) => connection.id);

		nodeGroups.push({ nodeIds, connectionIds });
	}

	return nodeGroups;
}
