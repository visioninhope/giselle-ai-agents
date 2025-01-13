import { createIdGenerator } from "@/lib/utils/generate-id";
import { z } from "zod";

export const nodeId = createIdGenerator("nd");
export type NodeId = z.infer<typeof nodeId.schema>;

export const BaseNodeData = z.object({
	id: nodeId.schema,
	name: z.string(),
	type: z.string(),
});
export type BaseNodeData = z.infer<typeof BaseNodeData>;

export const connectionHandleId = createIdGenerator("hndl");
export type ConnectionHandleId = z.infer<typeof connectionHandleId.schema>;

export const Position = z.object({
	x: z.number(),
	y: z.number(),
});

export const ConnectionHandle = z.object({
	id: connectionHandleId.schema,
	connectedSourceNodeId: nodeId.schema,
	connectedTargetNodeId: nodeId.schema,
	label: z.string(),
});

export const NodeUIState = z.object({
	position: Position,
	selected: z.boolean(),
});

export const Connection = z.object({
	id: z.string(),
	sourceNodeId: nodeId.schema,
	sourceNodeType: BaseNodeData.shape.type,
	targetNodeId: nodeId.schema,
	targetNodeType: BaseNodeData.shape.type,
	targetNodeHandleId: connectionHandleId.schema,
});
