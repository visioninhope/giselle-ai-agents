import { createIdGenerator } from "@giselle-sdk/utils";
import { z } from "zod";
import { InputId, NodeBase, NodeId, OutputId } from "./base";

export const ConnectionId = createIdGenerator("cnnc");
export type ConnectionId = z.infer<typeof ConnectionId.schema>;
export const Connection = z.object({
	id: ConnectionId.schema,
	outputNodeId: NodeId.schema,
	outputNodeType: NodeBase.shape.type,
	outputId: OutputId.schema,
	inputNodeId: NodeId.schema,
	inputNodeType: NodeBase.shape.type,
	inputId: InputId.schema,
});
export type Connection = z.infer<typeof Connection>;
