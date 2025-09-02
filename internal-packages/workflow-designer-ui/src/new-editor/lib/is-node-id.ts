import { NodeId } from "@giselle-sdk/data-type";

export function isNodeId(data: unknown): data is NodeId {
	const nodeId = NodeId.safeParse(data);
	return nodeId.success;
}
