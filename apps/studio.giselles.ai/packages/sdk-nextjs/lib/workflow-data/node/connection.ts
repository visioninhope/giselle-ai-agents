import {
	type BaseNodeData,
	type Connection,
	type ConnectionHandle,
	connectionHandleId,
	connectionId,
} from "./types";

export function createConnection({
	sourceNode,
	targetNodeHandle,
}: {
	sourceNode: BaseNodeData;
	targetNodeHandle: ConnectionHandle;
}): Connection {
	return {
		id: connectionId.generate(),
		sourceNodeId: sourceNode.id,
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
}: Omit<ConnectionHandle, "id">): ConnectionHandle {
	return {
		id: connectionHandleId.generate(),
		nodeId,
		nodeType,
		label,
	};
}
