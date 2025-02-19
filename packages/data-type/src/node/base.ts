import { createIdGenerator } from "@giselle-sdk/utils";
import { z } from "zod";

export const NodeId = createIdGenerator("nd");
export type NodeId = z.infer<typeof NodeId.schema>;

export const NodeBase = z.object({
	id: NodeId.schema,
	name: z.string().optional(),
	type: z.string(),
});
export type NodeBase = z.infer<typeof NodeBase>;

export const connectionHandleId = createIdGenerator("hndl");
export type ConnectionHandleId = z.infer<typeof connectionHandleId.schema>;

export const Position = z.object({
	x: z.number(),
	y: z.number(),
});

export const ConnectionHandle = z.object({
	id: connectionHandleId.schema,
	nodeId: NodeId.schema,
	nodeType: NodeBase.shape.type,
	label: z.string(),
	connectedNodeId: NodeId.schema,
});
export type ConnectionHandle = z.infer<typeof ConnectionHandle>;

export const NodeUIState = z.object({
	position: Position,
	selected: z.boolean().default(false).optional(),
	tab: z.string().optional(),
});
export type NodeUIState = z.infer<typeof NodeUIState>;

export const ConnectionId = createIdGenerator("cnnc");
export type ConnectionId = z.infer<typeof ConnectionId.schema>;
export const Connection = z.object({
	id: ConnectionId.schema,
	outputNodeId: NodeId.schema,
	sourceNodeType: NodeBase.shape.type,
	targetNodeId: NodeId.schema,
	targetNodeType: NodeBase.shape.type,
	targetNodeHandleId: connectionHandleId.schema,
});
export type Connection = z.infer<typeof Connection>;
