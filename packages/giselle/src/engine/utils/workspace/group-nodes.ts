import type { NodeId, Workspace } from "@giselle-sdk/data-type";

/**
 * Groups connected nodes in a workspace using Union-Find algorithm.
 * Returns an array of node groups, where each group is an array of connected node IDs.
 */
export function groupNodes(workspace: Workspace) {
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
	const groups = new Map<NodeId, NodeId[]>();
	for (const nodeId of nodeIds) {
		const root = findRoot(nodeId);
		const group = groups.get(root) || [];
		group.push(nodeId);
		groups.set(root, group);
	}

	// Return groups as arrays
	return Array.from(groups.values());
}
