import {
	type Connection,
	type ConnectionHandle,
	ConnectionId,
	type NodeBase,
	connectionHandleId,
} from "./base";

export function createConnection({
	sourceNode,
	targetNodeHandle,
}: {
	sourceNode: NodeBase;
	targetNodeHandle: ConnectionHandle;
}): Connection {
	return {
		id: ConnectionId.generate(),
		outputNodeId: sourceNode.id,
		outputNodeType: sourceNode.type,
		inputNodeId: targetNodeHandle.nodeId,
		inputNodeType: targetNodeHandle.nodeType,
		inputNodeHandleId: targetNodeHandle.id,
	};
}

export function createConnectionHandle({
	nodeId,
	nodeType,
	label,
	connectedNodeId,
}: Omit<ConnectionHandle, "id">): ConnectionHandle {
	return {
		id: connectionHandleId.generate(),
		nodeId,
		nodeType,
		label,
		connectedNodeId,
	};
}

export type { ConnectionHandle };
