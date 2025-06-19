import {
	type Connection,
	type ConnectionId,
	type NodeId,
	type NodeLike,
	type Workflow,
	WorkflowId,
} from "@giselle-sdk/data-type";
import {
	buildConnectedNodeIdList,
	buildJobList,
	collectConnectedConnections,
	collectConnectedNodes,
} from "./helper";

export function buildWorkflowList(
	nodeRecord: Record<NodeId, NodeLike>,
	connectionRecord: Record<ConnectionId, Connection>,
) {
	const workflows: Workflow[] = [];
	let processedNodes: NodeId[] = [];

	const connectedNodeIdList = buildConnectedNodeIdList(
		new Set(Object.values(connectionRecord)),
		new Set(Object.keys(nodeRecord) as NodeId[]),
	);
	for (const nodeId of Object.keys(nodeRecord) as NodeId[]) {
		const node = nodeRecord[nodeId];
		if (node.type !== "operation") continue;
		if (processedNodes.includes(nodeId)) continue;
		const connectedNodes = collectConnectedNodes(
			nodeId,
			nodeRecord,
			connectedNodeIdList,
		);
		const connectedNodeIdSet = new Set<NodeId>(connectedNodes.map((n) => n.id));
		const connectedConnections = collectConnectedConnections(
			connectedNodeIdSet,
			new Set(Object.values(connectionRecord)),
		);
		const workflowId = WorkflowId.generate();
		const jobList = buildJobList(
			new Set(connectedNodes),
			new Set(connectedConnections),
			workflowId,
		);
		workflows.push({
			id: workflowId,
			jobs: jobList,
			nodes: connectedNodes,
		});

		processedNodes = [...processedNodes, ...connectedNodeIdSet];
	}
	return workflows;
}
