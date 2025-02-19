import { createIdGenerator } from "@giselle-sdk/utils";
import { z } from "zod";
import { NodeBase, NodeId, PortId } from "./base";

export const ConnectionId = createIdGenerator("cnnc");
export type ConnectionId = z.infer<typeof ConnectionId.schema>;
export const Connection = z.object({
	id: ConnectionId.schema,
	outputNodeId: NodeId.schema,
	outputNodeType: NodeBase.shape.type,
	inputNodeId: NodeId.schema,
	inputNodeType: NodeBase.shape.type,
	inputPortId: PortId.schema,
});
export type Connection = z.infer<typeof Connection>;
