import type { ConnectionHandleId, NodeData, NodeId } from "./types";

export interface Connection {
	id: string;
	sourceNodeId: NodeId;
	outputNodeType: NodeData["type"];
	targetNodeId: NodeId;
	targetNodeType: NodeData["type"];
	targetNodeHandleId: ConnectionHandleId;
}
