import type { ConnectionHandleId, NodeData, NodeId } from "./types";

export interface Connection {
	id: string;
	sourceNodeId: NodeId;
	outputNodeType: NodeData["type"];
	inputNodeId: NodeId;
	inputNodeType: NodeData["type"];
	inputNodeHandleId: ConnectionHandleId;
}
