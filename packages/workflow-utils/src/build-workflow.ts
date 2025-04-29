import {
	type Connection,
	type ConnectionId,
	type Node,
	type NodeId,
	type Workflow,
	WorkflowId,
} from "@giselle-sdk/data-type";
import {
	createConnectedNodeIdMap,
	createJobMap,
	findConnectedConnectionMap,
	findConnectedNodeMap,
} from "./helper";

/**
 * Builds a workflow starting from a specific node ID.
 * Only includes nodes that are connected to/from the starting node.
 *
 * @param startNodeId - The ID of the node to start building the workflow from
 * @param nodeMap - Map of all node IDs to their node objects
 * @param connectionMap - Map of all connection IDs to their connection objects
 * @returns A workflow object or null if the node doesn't exist or isn't an operation node
 */
export function buildWorkflowFromNode(
	startNodeId: NodeId,
	nodeMap: Map<NodeId, Node>,
	connectionMap: Map<ConnectionId, Connection>,
): Workflow | null {
	const startNode = nodeMap.get(startNodeId);

	// Check if the node exists and is an operation node
	if (!startNode || startNode.type !== "operation") {
		return null;
	}

	// Create a map of connected node IDs
	const connectedNodeIdMap = createConnectedNodeIdMap(
		new Set(connectionMap.values()),
		new Set(nodeMap.keys()),
	);

	// Find all nodes connected to the starting node
	const connectedNodeMap = findConnectedNodeMap(
		startNodeId,
		nodeMap,
		connectedNodeIdMap,
	);

	// Find all connections between the connected nodes
	const connectedConnectionMap = findConnectedConnectionMap(
		new Set(connectedNodeMap.keys()),
		new Set(connectionMap.values()),
	);

	// Generate a workflow ID
	const workflowId = WorkflowId.generate();

	// Create jobs based on the connected nodes and connections
	const jobSet = createJobMap(
		new Set(connectedNodeMap.values()),
		new Set(connectedConnectionMap.values()),
		workflowId,
	);

	// Create and return the workflow
	return {
		id: workflowId,
		jobs: Array.from(jobSet.values()),
		nodes: Array.from(connectedNodeMap.values()),
	};
}

export function buildWorkflowMap(
	nodeMap: Map<NodeId, Node>,
	connectionMap: Map<ConnectionId, Connection>,
) {
	const workflowSet = new Set<Workflow>();
	let processedNodes: NodeId[] = [];

	const connectedNodeIdMap = createConnectedNodeIdMap(
		new Set(connectionMap.values()),
		new Set(nodeMap.keys()),
	);
	for (const [nodeId, node] of nodeMap) {
		if (node.type !== "operation") continue;
		if (processedNodes.includes(nodeId)) continue;
		const connectedNodeMap = findConnectedNodeMap(
			nodeId,
			nodeMap,
			connectedNodeIdMap,
		);
		const connectedConnectionMap = findConnectedConnectionMap(
			new Set(connectedNodeMap.keys()),
			new Set(connectionMap.values()),
		);
		const workflowId = WorkflowId.generate();
		const jobSet = createJobMap(
			new Set(connectedNodeMap.values()),
			new Set(connectedConnectionMap.values()),
			workflowId,
		);
		workflowSet.add({
			id: WorkflowId.generate(),
			jobs: Array.from(jobSet.values()),
			nodes: Array.from(connectedNodeMap.values()),
		});

		processedNodes = [...processedNodes, ...connectedNodeMap.keys()];
	}
	const workflowMap = new Map<WorkflowId, Workflow>();
	for (const workflow of workflowSet) {
		workflowMap.set(workflow.id, workflow);
	}
	return workflowMap;
}
